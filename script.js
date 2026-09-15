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


// OBTENER LETRA DE COLUMNA

function getColumn(index) {
    return String.fromCharCode(FIRST_CHAR_CODE + index);
}


// ACTUALIZAR CELDA

function updateCell([x, y, value]) {

    const newState = structuredClone(State);
    const constants = generateCellsConstants (newState) 

    const cell = newState[x][y];

    // Primero guardamos el valor que escribió el usuario
    cell.value = value;

    // Calculamos el resultado
    cell.computedValue = computedValue(value, constants);

    newState[x][y] = cell;

        computeAllCells(newState, constants)
    State = newState;

    renderSpreadsheet();
}


// GENERAR CONSTANTES

function generateCellsConstants(cells) {
    return cells.map((row, x) => {
        return row.map((cell, y) => {
            const letter = getColumn(x);
            const cellId = `${letter}${y + 1}`;
            return `const ${cellId} = ${cell.computedValue};`;
        }).join("\n");
    }).join("\n");
}

function computeAllCells(cells, constants){
    cells.forEach((rows, x) => {
        rows.forEach((cell, y) => {
            const result = computedValue(cell.value, constants);
            cell.computedValue = result;
        });
    });
}




// CALCULAR FORMULA

function computedValue(value, constants) {

    // Si no es una fórmula, dejamos exactamente lo que escribio el usuario
    if (typeof value === 'number') return value
    if (!value.startsWith("=")) {
        return value;
    }
    const formula = value.slice(1);
    let computedValue
    try {
        return eval(`(() => {
            ${constants}
            return ${formula};
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
                <th>${String.fromCharCode(FIRST_CHAR_CODE + i)}</th>
            `).join("")}

        </tr>
    `;

    $head.innerHTML = headerHTML;


    const bodyHTML = range(ROWS).map(row => `

        <tr>

            <td>${row + 1}</td>

            ${range(COLUMNS).map(column => {

                const cell = State[column][row];

                return `
                    <td
                        data-x="${column}"
                        data-y="${row}"
                    >

                        <span>${cell.computedValue}</span>

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

let selectedColumn = null;

$head.addEventListener('click', event => {

    const th = event.target.closest('th');
    if (!th) return;

    const x = [...th.parentNode.children].indexOf(th);

    console.log("TH:", th);
    console.log("X:", x);

    if (x === 0) return;

    selectedColumn = x - 1;

    $$(`tbody tr td:nth-child(${x + 1})`).forEach(el => {
        el.classList.add('selected');

        document.addEventListener('keydown', event=> {
            if(event.key=== 'Backspace' && selectedColumn === null){
                times (ROWS).forEach(row=> {
                        updateCell({x:selectedColumn, y:row, value:'' })
                        renderSpreadsheet

                })

            }

        })

    });
});

document.addEventListener('copy', event => {
    if (selectedColumn !== null) {
    const columnValues = times(ROWS).map(row => {
        return STATE[selectedColumn][row].computedValue
    })

    event.clipboardData.setData('text/plain', columnValues.join('\n'))
    event.preventDefault()
    }
})

document.addEventListener('click', event => {
    const { target } = event

    const isThClicked = target.closest('th')
    const isTdClicked = target.closest('td')

    if (!isThClicked && !isTdClicked) {
    $$('.selected').forEach(el => el.classList.remove('selected'))
    selectedColumn = null
    }
})




// PRIMER RENDER

renderSpreadsheet();