// DA TODAS LAS CONSTANTES CON LAS QUE SE TRABAJA

const $ = el => document.querySelector(el);

const $$ = el => document.querySelectorAll(el);

const $table = $("table");

const $head = $("thead");

const $body = $("tbody");

const COLUMNS = 15;

const ROWS = 10;

const FIRST_CHAR_CODE = 65;

const range = length =>
    Array.from({ length }, (_, i) => i);


// ESTADO INICIAL

let State = range(COLUMNS).map(x =>
    range(ROWS).map(y => ({
        computedValue: 0,
        value: 0
    }))
);

//GUARDAR LOS DATOS
const savedState = localStorage.getItem("spreadsheetState");

if (savedState) {
    State = JSON.parse(savedState);
}


// EXPORTAR 
function exportCSV() {
    let csv = "";

    State.forEach((column, x) => {
        column.forEach((cell, y) => {
            csv += `${getColumn(x)}${y + 1},${cell.computedValue}\n`;
        });
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "spreadsheet.csv";
    a.click();

    URL.revokeObjectURL(url);
}




// OBTENER LETRA DE COLUMNA

function getColumn(index) {
    return String.fromCharCode(FIRST_CHAR_CODE + index);
}


// ACTUALIZAR CELDA

function updateCell([x, y, value]) {
    const newState = structuredClone(State);
    const cell = newState[x][y];

    cell.value = value;
    newState[x][y] = cell;

    const constants = generateCellsConstants(newState);

    cell.computedValue = computedValue(value, constants, newState);

    computeAllCells(newState);
    
    State = newState;
    saveState();
    renderSpreadsheet();
}

function saveState() {
    localStorage.setItem("spreadsheetState", 
        JSON.stringify(State));
}





// GENERAR CONSTANTES

function generateCellsConstants(cells) {
    return cells.map((row, x) => {
        return row.map((cell, y) => {
            const letter = getColumn(x);
            const cellId = `${letter}${y + 1}`;

            const value = cell.computedValue === "" ? 0 : cell.computedValue;

            return `const ${cellId} = ${JSON.stringify(value)};`;
        }).join("\n");
    }).join("\n");
}


// CALCULAR TODAS LAS CELDAS

function computeAllCells(cells) {
    cells.forEach((rows, x) => {
        rows.forEach((cell, y) => {

            const constants = generateCellsConstants(cells);

            const result = computedValue(
                cell.value,
                constants,
                cells
            );

            cell.computedValue = result;
        });
    });
}


// CALCULAR FORMULA

function computedValue(value, constants, cells) {

    if (typeof value === "number") return value;

    if (!value.startsWith("=")) {
        return value;
    }

    const formula = value.slice(1);

    const formulaWithRanges = formula.replace(
        /([A-Z]+\d+):([A-Z]+\d+)/g,
        'getRange("$1", "$2")'
    );

    try {

        return eval(`(() => {

            ${constants}

            const getRange = (start, end) => {

                const startColumn =
                    start.charCodeAt(0) - FIRST_CHAR_CODE;

                const startRow =
                    parseInt(start.slice(1)) - 1;

                const endColumn =
                    end.charCodeAt(0) - FIRST_CHAR_CODE;

                const endRow =
                    parseInt(end.slice(1)) - 1;

                const values = [];

                for (let x = startColumn; x <= endColumn; x++) {

                    for (let y = startRow; y <= endRow; y++) {

                        values.push(
                            cells[x][y].computedValue
                        );

                    }

                }

                return values;
            };


            const SUMA = (...values) =>
                values
                    .flat()
                    .reduce(
                        (total, value) =>
                            total + Number(value),
                        0
                    );


            const PROMEDIO = (...values) => {

                const numbers =
                    values.flat().map(Number);

                return numbers.reduce(
                    (total, value) =>
                        total + value,
                    0
                ) / numbers.length;

            };


            const MAX = (...values) =>
                Math.max(
                    ...values.flat().map(Number)
                );


            const MIN = (...values) =>
                Math.min(
                    ...values.flat().map(Number)
                );


            return ${formulaWithRanges};

        })()`);

    } catch (e) {

        return `!ERROR: ${e.message}`;

    }
}


// MANEJO DE LAS CELDAS

$body.addEventListener("click", event => {

    const td = event.target.closest("td");

    if (!td) return;

    // Ignorar la columna de números de fila

    if (!td.dataset.x || !td.dataset.y) return;

    const { x, y } = td.dataset;

    const input = td.querySelector("input");

    if (!input) return;

    input.focus();

    input.select();


    // Evitamos agregar varios eventos
    // a la misma celda

    if (input.dataset.listener === "true") {
        return;
    }

    input.dataset.listener = "true";


    // ENTER = guardar

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            event.preventDefault();

            input.blur();

        }

    });


    // AL SALIR DE LA CELDA = guardar

    input.addEventListener("blur", () => {

        const value = input.value;

        console.log({
            value: value,
            state: State[x][y].value
        });


        // Si no cambió, no hacemos nada

        if (value === String(State[x][y].value)) {
            return;
        }

        updateCell([x, y, value]);

    });

});


// RENDERIZAR TABLA

const renderSpreadsheet = () => {

    const headerHTML = `

        <tr>

            <th></th>

            ${range(COLUMNS).map(i => `

                <th>
                    ${String.fromCharCode(
                        FIRST_CHAR_CODE + i
                    )}
                </th>

            `).join("")}

        </tr>

    `;

    $head.innerHTML = headerHTML;


    const bodyHTML = range(ROWS).map(row => `

        <tr>

            <td>
                ${row + 1}
            </td>


            ${range(COLUMNS).map(column => {

                const cell =
                    State[column][row];

                return `

                    <td
                        data-x="${column}"
                        data-y="${row}"
                    >

                        <span>
                            ${cell.computedValue}
                        </span>

                        <input
                            type="text"
                            value="${cell.value}"
                        >

                    </td>

                `;

            }).join("")}

        </tr>

    `).join("");


    $body.innerHTML = bodyHTML;

};


// SELECCIÓN DE TODA LA COLUMNA

let selectedColumn = null;

$head.addEventListener('click', event => {

    const th = event.target.closest('th');

    if (!th) return;

    const x =
        [...th.parentNode.children].indexOf(th);

    console.log("TH:", th);

    console.log("X:", x);

    if (x === 0) return;

    selectedColumn = x - 1;


    $$(
        `tbody tr td:nth-child(${x + 1})`
    ).forEach(el => {

        el.classList.add('selected');

    });

});


// COPIAR COLUMNA

document.addEventListener('copy', event => {

    if (selectedColumn !== null) {

        const columnValues =
            range(ROWS).map(row => {

                return State[
                    selectedColumn
                ][row].computedValue;

            });


        event.clipboardData.setData(
            'text/plain',
            columnValues.join('\n')
        );

        event.preventDefault();

    }

});


// QUITAR SELECCIÓN

document.addEventListener('click', event => {

    const { target } = event;

    const isThClicked =
        target.closest('th');

    const isTdClicked =
        target.closest('td');


    if (!isThClicked && !isTdClicked) {

        $$('.selected').forEach(el =>
            el.classList.remove('selected')
        );

        selectedColumn = null;

    }

});





// TERMINAR LA ESPORTACION 
function saveState() {
    localStorage.setItem("spreadsheetState", JSON.stringify(State));
}


function exportCSV() {
    let csv = "";

    State.forEach((column, x) => {
        column.forEach((cell, y) => {
            csv += `${getColumn(x)}${y + 1},${cell.computedValue}\n`;
        });
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "spreadsheet.csv";
    a.click();

    URL.revokeObjectURL(url);
}


const $exportar = $("#exportar");

$exportar.addEventListener("click", exportCSV);

// PRIMER RENDER

renderSpreadsheet();