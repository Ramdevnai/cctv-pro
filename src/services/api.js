// API Service for Google Sheets Integration
// Updated with your Google Apps Script deployment URL and CORS handling

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycby6mQjZdeCreMvwhs0BoJN7BIFDBMM5YXF-AUcSSXuxSXu0j_Bf1ZuthjAcwrAglivR/exec';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Mock data storage for development
let mockData = {
  products: [
    { id: '1', name: 'HD CCTV Camera', category: 'Cameras', price: 2500, stock: 25, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '2', name: '4 Channel DVR', category: 'DVR/NVR', price: 3500, stock: 15, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '3', name: 'CCTV Cable (100m)', category: 'Cables', price: 800, stock: 50, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '4', name: 'Power Supply 12V', category: 'Power Supply', price: 450, stock: 30, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '5', name: 'Dome Camera', category: 'Cameras', price: 1800, stock: 20, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '6', name: '8 Channel NVR', category: 'DVR/NVR', price: 5500, stock: 10, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '7', name: 'BNC Connector (Pack of 10)', category: 'Accessories', price: 150, stock: 100, created_date: '2024-01-01', updated_date: '2024-01-01' },
    { id: '8', name: 'CCTV Monitor 19"', category: 'Monitors', price: 12000, stock: 8, created_date: '2024-01-01', updated_date: '2024-01-01' },
  ],
  customers: [
    { id: '1', name: 'Rahul Security Systems', phone: '9876543210', email: 'rahul@security.com', total_purchases: 25000, last_purchase: '2024-01-15', created_date: '2024-01-01' },
    { id: '2', name: 'Priya Home Security', phone: '9876543211', email: 'priya@home.com', total_purchases: 15000, last_purchase: '2024-01-14', created_date: '2024-01-01' },
    { id: '3', name: 'Amit Office Solutions', phone: '9876543212', email: 'amit@office.com', total_purchases: 45000, last_purchase: '2024-01-13', created_date: '2024-01-01' },
  ],
  sales: [
    { 
      id: '1', 
      invoice_number: 'CCTV001', 
      customer_id: '1', 
      customer_name: 'Rahul Security Systems', 
      items: [
        { product_name: 'HD CCTV Camera', quantity: 4, price: 2500, total: 10000 },
        { product_name: '4 Channel DVR', quantity: 1, price: 3500, total: 3500 }
      ], 
      subtotal: 13500, 
      tax: 1350, 
      total: 14850, 
      status: 'completed', 
      date: '2024-01-15', 
      created_date: '2024-01-15' 
    },
    { 
      id: '2', 
      invoice_number: 'CCTV002', 
      customer_id: '2', 
      customer_name: 'Priya Home Security', 
      items: [
        { product_name: 'Dome Camera', quantity: 2, price: 1800, total: 3600 },
        { product_name: 'CCTV Cable (100m)', quantity: 1, price: 800, total: 800 },
        { product_name: 'Power Supply 12V', quantity: 2, price: 450, total: 900 }
      ], 
      subtotal: 5300, 
      tax: 530, 
      total: 5830, 
      status: 'completed', 
      date: '2024-01-14', 
      created_date: '2024-01-14' 
    },
    { 
      id: '3', 
      invoice_number: 'CCTV003', 
      customer_id: '3', 
      customer_name: 'Amit Office Solutions', 
      items: [
        { product_name: '8 Channel NVR', quantity: 1, price: 5500, total: 5500 },
        { product_name: 'HD CCTV Camera', quantity: 8, price: 2500, total: 20000 },
        { product_name: 'CCTV Monitor 19"', quantity: 1, price: 12000, total: 12000 }
      ], 
      subtotal: 37500, 
      tax: 3750, 
      total: 41250, 
      status: 'completed', 
      date: '2024-01-13', 
      created_date: '2024-01-13' 
    }
  ]
};

export const api = {
  async request(action, data = null) {
    try {
      // In development, use mock data for now due to CORS issues
      if (isDevelopment) {
        console.log(`Using mock data for ${action}`);
        return getMockData(action, data);
      }

      const url = `${API_BASE_URL}?action=${action}`;
      
      if (data) {
        // POST request for data operations
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, data }),
        };
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } else {
        // GET request
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
    } catch (error) {
      console.error('API request failed:', error);
      
      // Return mock data for development if API fails
      if (isDevelopment) {
        console.log('Returning mock data due to API failure');
        return getMockData(action, data);
      }
      
      throw error;
    }
  },
  
  // Products API
  getProducts: () => api.request('getProducts'),
  addProduct: (data) => api.request('addProduct', data),
  updateProduct: (data) => api.request('updateProduct', data),
  deleteProduct: (id) => api.request('deleteProduct', { id }),
  
  // Customers API
  getCustomers: () => api.request('getCustomers'),
  addCustomer: (data) => api.request('addCustomer', data),
  updateCustomer: (data) => api.request('updateCustomer', data),
  deleteCustomer: (id) => api.request('deleteCustomer', { id }),
  
  // Sales API
  getSales: () => api.request('getSales'),
  addSale: (data) => api.request('addSale', data),
  
  // Sync API
  syncAll: (data) => api.request('syncAll', data),
};

// Mock data functions for development
function getMockData(action, data = null) {
  switch (action) {
    case 'getProducts':
      return { products: mockData.products };
      
    case 'addProduct':
      const newProduct = {
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        price: data.price,
        stock: data.stock,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      };
      mockData.products.push(newProduct);
      return { id: newProduct.id, message: 'Product added successfully' };
      
    case 'updateProduct':
      const productIndex = mockData.products.findIndex(p => p.id === data.id);
      if (productIndex !== -1) {
        mockData.products[productIndex] = {
          ...mockData.products[productIndex],
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          updated_date: new Date().toISOString()
        };
        return { message: 'Product updated successfully' };
      }
      return { error: 'Product not found' };
      
    case 'deleteProduct':
      const deleteIndex = mockData.products.findIndex(p => p.id === data.id);
      if (deleteIndex !== -1) {
        mockData.products.splice(deleteIndex, 1);
        return { message: 'Product deleted successfully' };
      }
      return { error: 'Product not found' };
      
    case 'getCustomers':
      return { customers: mockData.customers };
      
    case 'addCustomer':
      const newCustomer = {
        id: Date.now().toString(),
        name: data.name,
        phone: data.phone,
        email: data.email,
        total_purchases: 0,
        last_purchase: null,
        created_date: new Date().toISOString()
      };
      mockData.customers.push(newCustomer);
      return { id: newCustomer.id, message: 'Customer added successfully' };
      
    case 'updateCustomer':
      const customerIndex = mockData.customers.findIndex(c => c.id === data.id);
      if (customerIndex !== -1) {
        mockData.customers[customerIndex] = {
          ...mockData.customers[customerIndex],
          name: data.name,
          phone: data.phone,
          email: data.email
        };
        return { message: 'Customer updated successfully' };
      }
      return { error: 'Customer not found' };
      
    case 'deleteCustomer':
      const customerDeleteIndex = mockData.customers.findIndex(c => c.id === data.id);
      if (customerDeleteIndex !== -1) {
        mockData.customers.splice(customerDeleteIndex, 1);
        return { message: 'Customer deleted successfully' };
      }
      return { error: 'Customer not found' };
      
    case 'getSales':
      // Return sales with properly structured items
      const salesWithParsedItems = mockData.sales.map(sale => ({
        ...sale,
        items: Array.isArray(sale.items) ? sale.items : 
               (typeof sale.items === 'string' ? JSON.parse(sale.items) : [])
      }));
      return { sales: salesWithParsedItems };
      
    case 'addSale':
      const newSale = {
        id: Date.now().toString(),
        invoice_number: data.invoice_number,
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        items: data.items, // Keep as array for mock data
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        status: data.status,
        date: data.date,
        created_date: new Date().toISOString()
      };
      mockData.sales.push(newSale);
      
      // Update customer's total purchases
      const customer = mockData.customers.find(c => c.id === data.customer_id);
      if (customer) {
        customer.total_purchases += data.total;
        customer.last_purchase = data.date;
      }
      
      return { id: newSale.id, message: 'Sale added successfully' };
      
    case 'syncAll':
      // In mock mode, just return success
      return { message: 'All data synced successfully (mock mode)' };
      
    default:
      return { error: 'Invalid action' };
  }
}

// Local Storage for offline functionality
export const localStorage = {
  // Products
  getLocalProducts: () => {
    try {
      const products = localStorage.getItem('vyapar_products');
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Error reading local products:', error);
      return [];
    }
  },
  
  setLocalProducts: (products) => {
    try {
      localStorage.setItem('vyapar_products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving local products:', error);
    }
  },
  
  // Customers
  getLocalCustomers: () => {
    try {
      const customers = localStorage.getItem('vyapar_customers');
      return customers ? JSON.parse(customers) : [];
    } catch (error) {
      console.error('Error reading local customers:', error);
      return [];
    }
  },
  
  setLocalCustomers: (customers) => {
    try {
      localStorage.setItem('vyapar_customers', JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving local customers:', error);
    }
  },
  
  // Sales
  getLocalSales: () => {
    try {
      const sales = localStorage.getItem('vyapar_sales');
      return sales ? JSON.parse(sales) : [];
    } catch (error) {
      console.error('Error reading local sales:', error);
      return [];
    }
  },
  
  setLocalSales: (sales) => {
    try {
      localStorage.setItem('vyapar_sales', JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving local sales:', error);
    }
  },
  
  // Clear all local data
  clearAll: () => {
    try {
      localStorage.removeItem('vyapar_products');
      localStorage.removeItem('vyapar_customers');
      localStorage.removeItem('vyapar_sales');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  },
};

// Sync functions
export const syncService = {
  // Sync local data to Google Sheets
  async syncToGoogleDrive(localData) {
    try {
      const response = await api.syncAll(localData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      console.error('Sync to Google Drive failed:', error);
      throw error;
    }
  },
  
  // Fetch data from Google Sheets
  async fetchFromGoogleDrive() {
    try {
      const [productsResponse, customersResponse, salesResponse] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getSales(),
      ]);
      
      const data = {
        products: productsResponse.products || [],
        customers: customersResponse.customers || [],
        sales: salesResponse.sales || [],
      };
      
      // Save to local storage
      localStorage.setLocalProducts(data.products);
      localStorage.setLocalCustomers(data.customers);
      localStorage.setLocalSales(data.sales);
      
      return data;
    } catch (error) {
      console.error('Fetch from Google Drive failed:', error);
      throw error;
    }
  },
  
  // Check if online
  isOnline: () => {
    return navigator.onLine;
  },
  
  // Get sync status
  getSyncStatus: () => {
    try {
      const lastSync = localStorage.getItem('vyapar_last_sync');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      return null;
    }
  },
  
  // Update sync timestamp
  updateSyncTimestamp: () => {
    try {
      localStorage.setItem('vyapar_last_sync', new Date().toISOString());
    } catch (error) {
      console.error('Error updating sync timestamp:', error);
    }
  },
};

// Hook for using API with loading states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const executeApiCall = async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    executeApiCall,
  };
};

// Import useState if using the hook
import { useState } from 'react'; 