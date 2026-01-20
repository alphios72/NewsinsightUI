const XLSX = require('xlsx');

const workbook = XLSX.readFile('data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

console.log('Sheet Name:', sheetName);
console.log('Headers:', headers);
console.log('First 2 rows:', XLSX.utils.sheet_to_json(worksheet).slice(0, 2));
