import hub from "../../../hub.js";
hub("mess/format/table");
export default function format_wrapTable(tableText) {
    const rows = tableText.trim().split("\n");
    let htmlTable = `<div class="table_wrap"><table>`;
    rows.forEach((row, index) => {
        const columns = row.split("|").map(cell => cell.trim()).filter(cell => cell);
        if (index === 0) {
            htmlTable += "<thead><tr>";
            columns.forEach(column => {
                htmlTable += `<th>${column}</th>`;
            });
            htmlTable += "</tr></thead><tbody>";
        }
        else {
            htmlTable += "<tr>";
            columns.forEach(column => {
                htmlTable += `<td>${column}</td>`;
            });
            htmlTable += "</tr>";
        }
    });
    htmlTable += "</tbody></table></div>";
    return htmlTable;
}
//# sourceMappingURL=table.js.map