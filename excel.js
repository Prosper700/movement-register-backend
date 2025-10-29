import ExcelJS from 'exceljs';

async function appendToExcel({ sender, subject, amount, recipient_office, imageUrl }) {
  const workbook = new ExcelJS.Workbook();
  const filePath = './excel/memo_log.xlsx';

  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.getWorksheet('Memos') || workbook.addWorksheet('Memos');

  sheet.addRow([new Date(), sender, subject, amount || '', recipient_office, imageUrl]);
  await workbook.xlsx.writeFile(filePath);
}
