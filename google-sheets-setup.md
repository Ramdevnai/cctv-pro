# Google Sheets & Apps Script Setup for Vyapar App

## 📋 **Step 1: Create Google Sheets**

### **1. Products Sheet (vyapar-products)**
Create a new Google Sheet with these columns:
```
A: id | B: name | C: category | D: price | E: stock | F: created_date | G: updated_date
```

### **2. Customers Sheet (vyapar-customers)**
Create a new Google Sheet with these columns:
```
A: id | B: name | C: phone | D: email | E: total_purchases | F: last_purchase | G: created_date
```

### **3. Sales Sheet (vyapar-sales)**
Create a new Google Sheet with these columns:
```
A: id | B: invoice_number | C: customer_id | D: customer_name | E: items | F: subtotal | G: tax | H: total | I: status | J: date | K: created_date
```

### **4. Settings Sheet (vyapar-settings)**
Create a new Google Sheet with these columns:
```
A: key | B: value | C: description
```

## 🔧 **Step 2: Create Google Apps Script**

### **1. Go to [script.google.com](https://script.google.com)**
- Click "New Project"
- Name it "Vyapar API"

### **2. Replace the default code with this:**

```javascript
// Google Apps Script for Vyapar App API
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual spreadsheet ID

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action || e.postData.contents ? JSON.parse(e.postData.contents).action : null;
    
    switch(action) {
      case 'getProducts':
        return getProducts();
      case 'addProduct':
        return addProduct(JSON.parse(e.postData.contents).data);
      case 'updateProduct':
        return updateProduct(JSON.parse(e.postData.contents).data);
      case 'deleteProduct':
        return deleteProduct(JSON.parse(e.postData.contents).id);
      case 'getCustomers':
        return getCustomers();
      case 'addCustomer':
        return addCustomer(JSON.parse(e.postData.contents).data);
      case 'updateCustomer':
        return updateCustomer(JSON.parse(e.postData.contents).data);
      case 'deleteCustomer':
        return deleteCustomer(JSON.parse(e.postData.contents).id);
      case 'getSales':
        return getSales();
      case 'addSale':
        return addSale(JSON.parse(e.postData.contents).data);
      case 'syncAll':
        return syncAll(JSON.parse(e.postData.contents).data);
      default:
        return createResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// Products Functions
function getProducts() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const products = data.slice(1).map(row => {
    const product = {};
    headers.forEach((header, index) => {
      product[header] = row[index];
    });
    return product;
  });
  return createResponse({ products });
}

function addProduct(productData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
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
  return createResponse({ id: newId, message: 'Product added successfully' });
}

function updateProduct(productData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
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
    return createResponse({ message: 'Product updated successfully' });
  }
  return createResponse({ error: 'Product not found' }, 404);
}

function deleteProduct(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return createResponse({ message: 'Product deleted successfully' });
  }
  return createResponse({ error: 'Product not found' }, 404);
}

// Customers Functions
function getCustomers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const customers = data.slice(1).map(row => {
    const customer = {};
    headers.forEach((header, index) => {
      customer[header] = row[index];
    });
    return customer;
  });
  return createResponse({ customers });
}

function addCustomer(customerData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
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
  return createResponse({ id: newId, message: 'Customer added successfully' });
}

function updateCustomer(customerData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === customerData.id);
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 2, 1, 3).setValues([[
      customerData.name,
      customerData.phone,
      customerData.email
    ]]);
    return createResponse({ message: 'Customer updated successfully' });
  }
  return createResponse({ error: 'Customer not found' }, 404);
}

function deleteCustomer(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === id);
  
  if (rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return createResponse({ message: 'Customer deleted successfully' });
  }
  return createResponse({ error: 'Customer not found' }, 404);
}

// Sales Functions
function getSales() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Sales');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const sales = data.slice(1).map(row => {
    const sale = {};
    headers.forEach((header, index) => {
      sale[header] = row[index];
    });
    return sale;
  });
  return createResponse({ sales });
}

function addSale(saleData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Sales');
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
  
  return createResponse({ id: newId, message: 'Sale added successfully' });
}

function updateCustomerPurchases(customerId, amount) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => row[0] === customerId);
  
  if (rowIndex > 0) {
    const currentTotal = data[rowIndex][4] || 0;
    sheet.getRange(rowIndex + 1, 5).setValue(currentTotal + amount);
    sheet.getRange(rowIndex + 1, 6).setValue(new Date().toISOString());
  }
}

// Sync Functions
function syncAll(data) {
  try {
    // Clear existing data
    clearSheet('Products');
    clearSheet('Customers');
    clearSheet('Sales');
    
    // Add headers
    addHeaders();
    
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
    
    return createResponse({ message: 'All data synced successfully' });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

function clearSheet(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  sheet.clear();
}

function addHeaders() {
  // Products headers
  const productsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  productsSheet.getRange(1, 1, 1, 7).setValues([['id', 'name', 'category', 'price', 'stock', 'created_date', 'updated_date']]);
  
  // Customers headers
  const customersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Customers');
  customersSheet.getRange(1, 1, 1, 7).setValues([['id', 'name', 'phone', 'email', 'total_purchases', 'last_purchase', 'created_date']]);
  
  // Sales headers
  const salesSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Sales');
  salesSheet.getRange(1, 1, 1, 11).setValues([['id', 'invoice_number', 'customer_id', 'customer_name', 'items', 'subtotal', 'tax', 'total', 'status', 'date', 'created_date']]);
}

// Utility Functions
function createResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);
  response.setStatusCode(statusCode);
  return response;
}
```

### **3. Deploy the Script**
- Click "Deploy" → "New deployment"
- Choose "Web app"
- Set access to "Anyone"
- Copy the deployment URL

## 🔗 **Step 3: Update Your React App**

You'll need to add API functions to your React app. Here's what you'll need:

### **API Configuration**
```javascript
// src/services/api.js
const API_BASE_URL = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL';

export const api = {
  async request(action, data = null) {
    const url = `${API_BASE_URL}?action=${action}`;
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify({ action, data });
    }
    
    const response = await fetch(url, options);
    return response.json();
  },
  
  // Products
  getProducts: () => api.request('getProducts'),
  addProduct: (data) => api.request('addProduct', data),
  updateProduct: (data) => api.request('updateProduct', data),
  deleteProduct: (id) => api.request('deleteProduct', { id }),
  
  // Customers
  getCustomers: () => api.request('getCustomers'),
  addCustomer: (data) => api.request('addCustomer', data),
  updateCustomer: (data) => api.request('updateCustomer', data),
  deleteCustomer: (id) => api.request('deleteCustomer', { id }),
  
  // Sales
  getSales: () => api.request('getSales'),
  addSale: (data) => api.request('addSale', data),
  
  // Sync
  syncAll: (data) => api.request('syncAll', data),
};
```

## 📝 **Step 4: Setup Instructions**

1. **Create the Google Sheets** with the exact names and column structures
2. **Copy the Spreadsheet ID** from the URL (the long string between /d/ and /edit)
3. **Replace `YOUR_SPREADSHEET_ID_HERE`** in the Apps Script code
4. **Deploy the Apps Script** and copy the deployment URL
5. **Update your React app** with the API configuration
6. **Test the sync functionality**

## 🔒 **Security Notes**

- The Apps Script will be publicly accessible
- Consider adding authentication if needed
- Google Sheets has rate limits (100 requests per 100 seconds per user)
- For production use, consider using Google Cloud Platform APIs

## 🚀 **Next Steps**

Once you have this set up, you can:
1. Replace the sample data in your React app with real API calls
2. Implement the sync buttons to actually sync data
3. Add error handling and loading states
4. Implement offline functionality with local storage

Would you like me to help you implement any specific part of this setup? 