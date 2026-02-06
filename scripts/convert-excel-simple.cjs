const fs = require('fs');
const XLSX = require('xlsx');

function convertExcelToCSV(excelPath, outputPath) {
  console.log('📊 Converting Excel to CSV...');
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      console.error('❌ No data found in Excel file');
      process.exit(1);
    }
    
    // Get headers (first row)
    const headers = jsonData[0];
    console.log('📋 Found headers:', headers);
    
    // Map to our expected CSV format
    const csvHeaders = [
      'title', 'brand', 'category', 'price', 'image_url', 'product_url', 
      'description', 'sku', 'size', 'color'
    ];
    
    // Create mapping from Excel headers to CSV headers
    const headerMap = {};
    headers.forEach((header, index) => {
      const cleanHeader = header?.toString().toLowerCase().trim();
      // Try to match common variations
      if (cleanHeader?.includes('title') || cleanHeader?.includes('name') || cleanHeader?.includes('product')) {
        headerMap[header] = 'title';
      } else if (cleanHeader?.includes('brand') || cleanHeader?.includes('manufacturer')) {
        headerMap[header] = 'brand';
      } else if (cleanHeader?.includes('category') || cleanHeader?.includes('type')) {
        headerMap[header] = 'category';
      } else if (cleanHeader?.includes('price') || cleanHeader?.includes('cost')) {
        headerMap[header] = 'price';
      } else if (cleanHeader?.includes('image') || cleanHeader?.includes('photo') || cleanHeader?.includes('picture')) {
        headerMap[header] = 'image_url';
      } else if (cleanHeader?.includes('url') || cleanHeader?.includes('link')) {
        headerMap[header] = 'product_url';
      } else if (cleanHeader?.includes('description') || cleanHeader?.includes('desc')) {
        headerMap[header] = 'description';
      } else if (cleanHeader?.includes('sku') || cleanHeader?.includes('code')) {
        headerMap[header] = 'sku';
      } else if (cleanHeader?.includes('size')) {
        headerMap[header] = 'size';
      } else if (cleanHeader?.includes('color') || cleanHeader?.includes('colour')) {
        headerMap[header] = 'color';
      }
    });
    
    console.log('🔗 Header mapping:', headerMap);
    
    // Convert data rows
    const csvData = [csvHeaders]; // Start with headers
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const csvRow = [];
      csvHeaders.forEach(header => {
        // Find the mapped Excel column
        const excelHeader = Object.keys(headerMap).find(key => headerMap[key] === header);
        if (excelHeader) {
          const excelIndex = headers.indexOf(excelHeader);
          const value = excelIndex >= 0 ? (row[excelIndex] || '').toString().trim() : '';
          csvRow.push(value);
        } else {
          csvRow.push(''); // Empty if no mapping found
        }
      });
      
      csvData.push(csvRow);
    }
    
    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Write CSV file
    fs.writeFileSync(outputPath, csvString, 'utf-8');
    
    console.log(`✅ Successfully converted to ${outputPath}`);
    console.log(`📊 Converted ${csvData.length - 1} products`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

// Get file paths from command line arguments
const excelPath = process.argv[2];
const outputPath = process.argv[3] || 'shoes.csv';

if (!excelPath) {
  console.error('❌ Please provide the path to your Excel file:');
  console.log('node scripts/convert-excel-simple.js path/to/your/file.xlsx');
  process.exit(1);
}

convertExcelToCSV(excelPath, outputPath);
