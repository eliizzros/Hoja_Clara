
const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const $table = $("table");
const $head = $("thead");
const $body = $("tbody");

const COLUMNS = 15;
const ROWS = 10;
const FIRST_CHARD_CODE = 65;

const range = length => Array.from({ length }, (_, i) => i);

let State = range(COLUMNS)
    .map(i => range(ROWS)
        .map(j => ({
            computedValue: 0,
            value: 0
        }))
    );

console.log(State);

function updateCell([x, y, value]) {
    const newState = structuredClone(State);
    const cell = newState[x][y];
    cell.computedValue = computedValue(value);
    cell.value = value;
    newState[x][y] = cell;
    State = newState;
    renderSpreadsheet();
}

function computedValue(value){
    if (!value.startsWith('=')) return value

    const formula = value.slice(1)
    let result

    try {
        result = eval(formula)
    } catch (e){
        result = `!ERROR: ${e.message}`
    }

    return result
}

$body.addEventListener('click', event => {
    const td = event.target.closest('td');
    if (!td) return;

    const { x, y } = td.dataset;
    const input = td.querySelector('input');
    const span = td.querySelector('span');
    const end = input.value.length;
    input.setSelectionRange(0, end);
    input.focus();

    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.addEventListener('blur', event => {
        console.log({
            value: input.value,
            state: State[x][y].value
        });

        console.log
        if (input.value == State[x][y].value) return;
        updateCell([x, y, input.value]);
    }, { once: true });
});

const renderSpreadsheet = () => {
    const headerHTML = `<tr>
        <th></th>
        ${range(COLUMNS).map(i => `
            <th>${String.fromCharCode(FIRST_CHARD_CODE + i)}</th>
        `).join('')}
    </tr>`;
    $head.innerHTML = headerHTML;

    const bodyHTML = range(ROWS).map(row => `
        <tr>
            <td>${row + 1}</td>
            ${range(COLUMNS).map(column => `
                <td data-x="${column}" data-y="${row}">
                    <span>${State[column][row].computedValue}</span>
                    <input 
                        type="text" 
                        value="${State[column][row].value}"
                    >
                </td>
            `).join('')}
        </tr>
    `).join('');
    $body.innerHTML = bodyHTML;
};

renderSpreadsheet();