#!/usr/bin/env node

console.log('🚀 Vyapar App - Google Sheets Setup Helper\n');

console.log('📋 Step 1: Create Google Sheets');
console.log('Go to https://sheets.google.com and create these 4 spreadsheets:\n');

console.log('1. vyapar-products');
console.log('   Headers: id | name | category | price | stock | created_date | updated_date\n');

console.log('2. vyapar-customers');
console.log('   Headers: id | name | phone | email | total_purchases | last_purchase | created_date\n');

console.log('3. vyapar-sales');
console.log('   Headers: id | invoice_number | customer_id | customer_name | items | subtotal | tax | total | status | date | created_date\n');

console.log('4. vyapar-settings');
console.log('   Headers: key | value | description\n');

console.log('📊 Step 2: Get Spreadsheet IDs');
console.log('For each spreadsheet, copy the ID from the URL:');
console.log('URL format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit');
console.log('Copy the long string between /d/ and /edit\n');

console.log('🔧 Step 3: Create Google Apps Script');
console.log('1. Go to https://script.google.com');
console.log('2. Click "New Project"');
console.log('3. Name it "Vyapar API"');
console.log('4. Replace the default code with the code from google-sheets-setup.md');
console.log('5. Replace YOUR_SPREADSHEET_ID_HERE with your actual spreadsheet ID\n');

console.log('🚀 Step 4: Deploy the Script');
console.log('1. Click "Deploy" → "New deployment"');
console.log('2. Choose "Web app"');
console.log('3. Set "Execute as" to "Me"');
console.log('4. Set "Who has access" to "Anyone"');
console.log('5. Click "Deploy"');
console.log('6. Copy the deployment URL\n');

console.log('🔗 Step 5: Update Your App');
console.log('1. Copy the deployment URL');
console.log('2. Update the API_BASE_URL in src/services/api.js');
console.log('3. Or set the VITE_GOOGLE_APPS_SCRIPT_URL environment variable\n');

console.log('🧪 Step 6: Test');
console.log('1. Restart your development server: npm run dev');
console.log('2. Try adding a customer or product');
console.log('3. Check if data appears in your Google Sheets\n');

console.log('📝 Quick Configuration:');
console.log('To use Google Sheets in development, make sure:');
console.log('- VITE_USE_MOCK_DATA is NOT set to "true"');
console.log('- VITE_GOOGLE_APPS_SCRIPT_URL is set to your deployment URL');
console.log('- Your Google Apps Script is properly deployed and accessible\n');

console.log('❓ Need Help?');
console.log('- Check the SETUP_GUIDE.md for detailed instructions');
console.log('- Make sure your Google Apps Script has proper CORS headers');
console.log('- Verify your spreadsheet IDs are correct');
console.log('- Test the Apps Script URL directly in your browser\n'); 