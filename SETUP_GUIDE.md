# 🚀 Vyapar App - Google Sheets Integration Setup Guide

## 📋 **What You Need to Set Up**

To enable sync functionality in your Vyapar app, you'll need to create:

1. **4 Google Sheets** (for data storage)
2. **1 Google Apps Script** (as your backend API)
3. **Update your React app** (to use the API)

---

## 📊 **Step 1: Create Google Sheets**

### **1.1 Create Products Sheet**
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet named `vyapar-products`
3. Add these headers in row 1:
   ```
   A1: id | B1: name | C1: category | D1: price | E1: stock | F1: created_date | G1: updated_date
   ```

### **1.2 Create Customers Sheet**
1. Create another spreadsheet named `vyapar-customers`
2. Add these headers in row 1:
   ```
   A1: id | B1: name | C1: phone | D1: email | E1: total_purchases | F1: last_purchase | G1: created_date
   ```

### **1.3 Create Sales Sheet**
1. Create another spreadsheet named `vyapar-sales`
2. Add these headers in row 1:
   ```
   A1: id | B1: invoice_number | C1: customer_id | D1: customer_name | E1: items | F1: subtotal | G1: tax | H1: total | I1: status | J1: date | K1: created_date
   ```

### **1.4 Create Settings Sheet**
1. Create another spreadsheet named `vyapar-settings`
2. Add these headers in row 1:
   ```
   A1: key | B1: value | C1: description
   ```

### **1.5 Get Spreadsheet IDs**
For each spreadsheet, copy the ID from the URL:
- URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- Copy the long string between `/d/` and `/edit`

---

## 🔧 **Step 2: Create Google Apps Script**

### **2.1 Create the Script**
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "Vyapar API"
4. Replace the default code with the code from `google-sheets-setup.md`

### **2.2 Update Spreadsheet ID**
In the Apps Script code, replace:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```
With your actual spreadsheet ID.

### **2.3 Deploy the Script**
1. Click "Deploy" → "New deployment"
2. Choose "Web app"
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the deployment URL (you'll need this for your React app)

---

## 🔗 **Step 3: Update Your React App**

### **3.1 Update API Configuration**
In `src/services/api.js`, replace:
```javascript
const API_BASE_URL = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL';
```
With your actual deployment URL.

### **3.2 Test the Connection**
Add this to any component to test:
```javascript
import { api } from '../services/api';

// Test function
const testConnection = async () => {
  try {
    const result = await api.getProducts();
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

---

## 🧪 **Step 4: Test Everything**

### **4.1 Test API Endpoints**
1. Open browser console
2. Run the test function above
3. Check if you get a response

### **4.2 Test Sync Functionality**
1. Add some test data in your app
2. Click sync buttons
3. Check if data appears in Google Sheets

---

## 🔒 **Security & Best Practices**

### **Security Notes:**
- ⚠️ The Apps Script will be publicly accessible
- 🔐 Consider adding authentication for production use
- 📊 Google Sheets has rate limits (100 requests per 100 seconds)
- 💾 For sensitive data, use Google Cloud Platform APIs instead

### **Rate Limiting:**
- Add delays between API calls
- Implement retry logic
- Cache data locally when possible

### **Error Handling:**
- Always check for network errors
- Implement fallback to local storage
- Show user-friendly error messages

---

## 🚀 **Quick Start Checklist**

- [ ] Created 4 Google Sheets with correct headers
- [ ] Copied all spreadsheet IDs
- [ ] Created Google Apps Script with the provided code
- [ ] Updated spreadsheet ID in Apps Script
- [ ] Deployed Apps Script and copied URL
- [ ] Updated API_BASE_URL in React app
- [ ] Tested API connection
- [ ] Tested sync functionality

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**1. CORS Errors**
- Make sure Apps Script is deployed as "Web app"
- Check that "Who has access" is set to "Anyone"

**2. 404 Errors**
- Verify the deployment URL is correct
- Check that the Apps Script is deployed

**3. Permission Errors**
- Make sure you own the Google Sheets
- Check that Apps Script has permission to access Sheets

**4. Data Not Syncing**
- Check browser console for errors
- Verify spreadsheet IDs are correct
- Ensure Google Sheets have the correct headers

### **Debug Steps:**
1. Check browser console for errors
2. Test Apps Script directly in browser
3. Verify spreadsheet permissions
4. Check network tab for failed requests

---

## 📞 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all setup steps are completed
3. Test each component individually
4. Check Google Apps Script logs for errors

The setup might take 15-30 minutes, but once configured, your app will have full sync capabilities with Google Sheets! 