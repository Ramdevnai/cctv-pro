// Google Apps Script for Vyapar App API
// Updated with your specific spreadsheet IDs and CORS handling

// Spreadsheet IDs from your Google Sheets
const SPREADSHEET_IDS = {
  customers: '15IzE6bHNpefPUamamhxrux3nck_xi-3fBpO8UZoiinw',
  products: '1eK9Wy-DUvi2b4Cn_nyJ09GMc1wnaMfvzCD7ZQ2cLnQg',
  sales: '1d5cC4Kr7MJuJwY7RlmrzBuv9cUVb_d9Ej4jkfq2cBcs',
  settings: '1drTymhlzj_oiubuqNcTuJgglIuIQVo60I1A5mDgTkVU'
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action || e.postData.contents ? JSON.parse(e.postData.contents).action : null;
    
    let result;
    switch(action) {
      case 'getProducts':
        result = getProducts();
        break;
      case 'addProduct':
        result = addProduct(JSON.parse(e.postData.contents).data);
        break;
      case 'updateProduct':
        result = updateProduct(JSON.parse(e.postData.contents).data);
        break;
      case 'deleteProduct':
        result = deleteProduct(JSON.parse(e.postData.contents).id);
        break;
      case 'getCustomers':
        result = getCustomers();
        break;
      case 'addCustomer':
        result = addCustomer(JSON.parse(e.postData.contents).data);
        break;
      case 'updateCustomer':
        result = updateCustomer(JSON.parse(e.postData.contents).data);
        break;
      case 'deleteCustomer':
        result = deleteCustomer(JSON.parse(e.postData.contents).id);
        break;
      case 'getSales':
        result = getSales();
        break;
      case 'addSale':
        result = addSale(JSON.parse(e.postData.contents).data);
        break;
      case 'syncAll':
        result = syncAll(JSON.parse(e.postData.contents).data);
        break;
      default:
        result = { error: 'Invalid action' };
    }
    
    return createResponse(result);
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// Products Functions
function getProducts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { products: [] };
    }
    
    const headers = data[0];
    const products = data.slice(1).map(row => {
      const product = {};
      headers.forEach((header, index) => {
        product[header] = row[index];
      });
      return product;
    });
    return { products };
  } catch (error) {
    return { error: 'Failed to get products: ' + error.toString() };
  }
}

function addProduct(productData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products).getActiveSheet();
    const newId = Date.now().toString();
    const row = [
      newId,
      productData.name,
      productData.category,
      productData.price,
      productData.stock,
      new Date().toISOString(),
      new Date().toISOString()
    ];
    sheet.appendRow(row);
    return { id: newId, message: 'Product added successfully' };
  } catch (error) {
    return { error: 'Failed to add product: ' + error.toString() };
  }
}

function updateProduct(productData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === productData.id);
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex + 1, 2, 1, 4).setValues([[
        productData.name,
        productData.category,
        productData.price,
        productData.stock
      ]]);
      sheet.getRange(rowIndex + 1, 7).setValue(new Date().toISOString());
      return { message: 'Product updated successfully' };
    }
    return { error: 'Product not found' };
  } catch (error) {
    return { error: 'Failed to update product: ' + error.toString() };
  }
}

function deleteProduct(id) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === id);
    
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
      return { message: 'Product deleted successfully' };
    }
    return { error: 'Product not found' };
  } catch (error) {
    return { error: 'Failed to delete product: ' + error.toString() };
  }
}

// Customers Functions
function getCustomers() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { customers: [] };
    }
    
    const headers = data[0];
    const customers = data.slice(1).map(row => {
      const customer = {};
      headers.forEach((header, index) => {
        customer[header] = row[index];
      });
      return customer;
    });
    return { customers };
  } catch (error) {
    return { error: 'Failed to get customers: ' + error.toString() };
  }
}

function addCustomer(customerData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    const newId = Date.now().toString();
    const row = [
      newId,
      customerData.name,
      customerData.phone,
      customerData.email,
      0, // total_purchases
      null, // last_purchase
      new Date().toISOString()
    ];
    sheet.appendRow(row);
    return { id: newId, message: 'Customer added successfully' };
  } catch (error) {
    return { error: 'Failed to add customer: ' + error.toString() };
  }
}

function updateCustomer(customerData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === customerData.id);
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex + 1, 2, 1, 3).setValues([[
        customerData.name,
        customerData.phone,
        customerData.email
      ]]);
      return { message: 'Customer updated successfully' };
    }
    return { error: 'Customer not found' };
  } catch (error) {
    return { error: 'Failed to update customer: ' + error.toString() };
  }
}

function deleteCustomer(id) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === id);
    
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex + 1);
      return { message: 'Customer deleted successfully' };
    }
    return { error: 'Customer not found' };
  } catch (error) {
    return { error: 'Failed to delete customer: ' + error.toString() };
  }
}

// Sales Functions
function getSales() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.sales).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { sales: [] };
    }
    
    const headers = data[0];
    const sales = data.slice(1).map(row => {
      const sale = {};
      headers.forEach((header, index) => {
        sale[header] = row[index];
      });
      return sale;
    });
    return { sales };
  } catch (error) {
    return { error: 'Failed to get sales: ' + error.toString() };
  }
}

function addSale(saleData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.sales).getActiveSheet();
    const newId = Date.now().toString();
    const row = [
      newId,
      saleData.invoice_number,
      saleData.customer_id,
      saleData.customer_name,
      JSON.stringify(saleData.items),
      saleData.subtotal,
      saleData.tax,
      saleData.total,
      saleData.status,
      saleData.date,
      new Date().toISOString()
    ];
    sheet.appendRow(row);
    
    // Update customer's total purchases
    updateCustomerPurchases(saleData.customer_id, saleData.total);
    
    return { id: newId, message: 'Sale added successfully' };
  } catch (error) {
    return { error: 'Failed to add sale: ' + error.toString() };
  }
}

function updateCustomerPurchases(customerId, amount) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === customerId);
    
    if (rowIndex > 0) {
      const currentTotal = data[rowIndex][4] || 0;
      sheet.getRange(rowIndex + 1, 5).setValue(currentTotal + amount);
      sheet.getRange(rowIndex + 1, 6).setValue(new Date().toISOString());
    }
  } catch (error) {
    console.error('Failed to update customer purchases:', error);
  }
}

// Sync Functions
function syncAll(data) {
  try {
    // Clear existing data and add headers
    setupSheets();
    
    // Sync products
    if (data.products && data.products.length > 0) {
      data.products.forEach(product => {
        addProduct(product);
      });
    }
    
    // Sync customers
    if (data.customers && data.customers.length > 0) {
      data.customers.forEach(customer => {
        addCustomer(customer);
      });
    }
    
    // Sync sales
    if (data.sales && data.sales.length > 0) {
      data.sales.forEach(sale => {
        addSale(sale);
      });
    }
    
    return { message: 'All data synced successfully' };
  } catch (error) {
    return { error: 'Failed to sync data: ' + error.toString() };
  }
}

function setupSheets() {
  try {
    // Setup Products sheet
    const productsSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products).getActiveSheet();
    productsSheet.clear();
    productsSheet.getRange(1, 1, 1, 7).setValues([['id', 'name', 'category', 'price', 'stock', 'created_date', 'updated_date']]);
    
    // Setup Customers sheet
    const customersSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers).getActiveSheet();
    customersSheet.clear();
    customersSheet.getRange(1, 1, 1, 7).setValues([['id', 'name', 'phone', 'email', 'total_purchases', 'last_purchase', 'created_date']]);
    
    // Setup Sales sheet
    const salesSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.sales).getActiveSheet();
    salesSheet.clear();
    salesSheet.getRange(1, 1, 1, 11).setValues([['id', 'invoice_number', 'customer_id', 'customer_name', 'items', 'subtotal', 'tax', 'total', 'status', 'date', 'created_date']]);
    
    // Setup Settings sheet
    const settingsSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.settings).getActiveSheet();
    settingsSheet.clear();
    settingsSheet.getRange(1, 1, 1, 3).setValues([['key', 'value', 'description']]);
  } catch (error) {
    console.error('Failed to setup sheets:', error);
  }
}

// Utility Functions
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);
  response.setStatusCode(statusCode);
  
  // Add CORS headers
  response.addHeader('Access-Control-Allow-Origin', '*');
  response.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}

// Test function to verify setup
function testSetup() {
  try {
    // Test if all spreadsheets are accessible
    const productsSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.products);
    const customersSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.customers);
    const salesSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.sales);
    const settingsSheet = SpreadsheetApp.openById(SPREADSHEET_IDS.settings);
    
    console.log('✅ All spreadsheets are accessible');
    console.log('Products Sheet:', productsSheet.getName());
    console.log('Customers Sheet:', customersSheet.getName());
    console.log('Sales Sheet:', salesSheet.getName());
    console.log('Settings Sheet:', settingsSheet.getName());
    
    return 'Setup test completed successfully!';
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    return 'Setup test failed: ' + error.toString();
  }
} 