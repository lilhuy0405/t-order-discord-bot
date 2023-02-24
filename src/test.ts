import Excel = require('exceljs');
const main = async () => {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile('./data.xlsx')
    const worksheet = workbook.getWorksheet(1);
    const listShipCode = [];
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
        console.log(rowNumber, row.getCell('E').value);
    
    });
}

main().then()
