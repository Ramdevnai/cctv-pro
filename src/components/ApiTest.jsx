import { useState } from 'react';
import { api } from '../services/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [useRealApi, setUseRealApi] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get Products
      console.log('Testing getProducts...');
      const productsResponse = await api.getProducts();
      results.products = productsResponse.products ? '✅ Success' : '❌ Failed';
      console.log('Products response:', productsResponse);

      // Test 2: Get Customers
      console.log('Testing getCustomers...');
      const customersResponse = await api.getCustomers();
      results.customers = customersResponse.customers ? '✅ Success' : '❌ Failed';
      console.log('Customers response:', customersResponse);

      // Test 3: Get Sales
      console.log('Testing getSales...');
      const salesResponse = await api.getSales();
      results.sales = salesResponse.sales ? '✅ Success' : '❌ Failed';
      console.log('Sales response:', salesResponse);

      // Test 4: Add a test product
      console.log('Testing addProduct...');
      const testProduct = {
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        stock: 10
      };
      const addProductResponse = await api.addProduct(testProduct);
      results.addProduct = addProductResponse.id ? '✅ Success' : '❌ Failed';
      console.log('Add product response:', addProductResponse);

    } catch (error) {
      console.error('API test failed:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  const testRealGoogleSheets = async () => {
    setLoading(true);
    const results = {};

    try {
      // Temporarily override the API to use real Google Sheets
      const originalRequest = api.request;
      
      api.request = async (action, data = null) => {
        const url = `https://script.google.com/macros/s/AKfycby6mQjZdeCreMvwhs0BoJN7BIFDBMM5YXF-AUcSSXuxSXu0j_Bf1ZuthjAcwrAglivR/exec?action=${action}`;
        
        if (data) {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, data }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } else {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        }
      };

      // Test real Google Sheets API
      console.log('Testing REAL Google Sheets API...');
      
      // Test 1: Get Products from Google Sheets
      const productsResponse = await api.getProducts();
      results.realProducts = productsResponse.products ? '✅ Success' : '❌ Failed';
      console.log('Real Products response:', productsResponse);

      // Test 2: Add product to Google Sheets
      const testProduct = {
        name: 'Real Test Product',
        category: 'Real Test Category',
        price: 150,
        stock: 20
      };
      const addProductResponse = await api.addProduct(testProduct);
      results.realAddProduct = addProductResponse.id ? '✅ Success' : '❌ Failed';
      console.log('Real Add Product response:', addProductResponse);

      // Restore original API
      api.request = originalRequest;

    } catch (error) {
      console.error('Real API test failed:', error);
      results.realError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">API Connection Test</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Current Mode:</h3>
        <p className="text-blue-700 text-sm">
          {useRealApi ? '🔄 Real Google Sheets API' : '🎭 Mock Data (Development)'}
        </p>
        <p className="text-blue-600 text-xs mt-1">
          Mock data works in development. Real API will be used in production.
        </p>
      </div>
      
      <div className="flex gap-3 mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Mock Data'}
        </button>
        
        <button
          onClick={testRealGoogleSheets}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Real Google Sheets'}
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Results:</h3>
          <div className="space-y-2">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">{test}:</span>
                <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Mock Data:</strong> Works in development, data stored in browser memory</li>
          <li>• <strong>Real API:</strong> Saves data to your Google Sheets (may have CORS issues in development)</li>
          <li>• <strong>Production:</strong> Will automatically use real Google Sheets API</li>
          <li>• <strong>Check Google Sheets:</strong> After testing real API, verify data appears in your spreadsheets</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest; 