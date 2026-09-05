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
            computedValue: j,
            value: j
        }))
    );

console.log(State);

const renderSpreadsheet = () => {

    const headerHTML = `<tr>
        <th></th>
        ${range(COLUMNS).map(i => `
        <th>${String.fromCharCode(FIRST_CHARD_CODE + i)}</th>`).join('')}
    </tr>`;

    $head.innerHTML = headerHTML;

    const bodyHTML = range(ROWS).map(row => `
        <tr>
            <td>${row + 1}</td>
            ${range(COLUMNS).map(column => `<td data-x="${column}" data-y="${row}">
            <span>${State[column][row].computedValue}</span>
            <input type="text" value="${State[column][row].value}"> </input>
            </td>`).join('')}
        </tr>
    `).join('');

    $body.innerHTML = bodyHTML;

    $body.addEventListener('click', event => {

        const td = event.target.closest('td');

        if (!td) return;

        const { x, y } = td.dataset;

        const input = td.querySelector('input');

        const span = td.querySelector('span');

        const end = input.value.length
        input.setSelectionRange(0, end)


        input.focus()

    });

}

renderSpreadsheet();

