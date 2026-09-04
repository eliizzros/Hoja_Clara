const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const ROWS = 10;
const COLUMNS = 15;

const range = length => Array.from({ length }, (_, i) => i);

const renderSpreadsheet = () => {
    const $table = $("table");
    const $head = $("thead");
    const $body = $("tbody");

   const headerHTML = `<tr>
        <th></th>
        ${range(COLUMNS).map(i => `
          <th>${String.fromCharCode(65 + i)}</th>`).join('')}
    </tr>`;
    $head.innerHTML = headerHTML;

    const bodyHTML = range(ROWS).map(row => `
        <tr>
            <td>${row + 1}</td>
            ${range(COLUMNS).map(column => `<td data=x"${column}" data=y="${row}">
              <span>  </span>
              <input type= "text" values=""> </input>

              </td>`).join('')}
        </tr>
    `).join('');

    $body.innerHTML = bodyHTML;
};

renderSpreadsheet();