const XLSX = require('xlsx');

const workbook = XLSX.readFile('data.xlsx');
console.log('Sheets found:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    console.log(`\nSheet: ${sheetName}`);
    console.log('Headers:', headers);
});
