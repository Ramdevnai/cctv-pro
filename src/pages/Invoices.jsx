import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Invoices() {
  // State management
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersResponse, productsResponse] = await Promise.all([
        api.getCustomers(),
        api.getProducts()
      ]);
      
      setCustomers(customersResponse.customers || []);
      setProducts(productsResponse.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Invoice item management
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      productId: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateItem = (id, field, value) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill price when product is selected
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          updatedItem.price = product ? product.price : 0;
        }
        
        // Calculate total when quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    });
    setInvoiceItems(updatedItems);
  };

  const removeItem = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  // Calculations
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Customer management
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newCustomer = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email')
    };

    try {
      const response = await api.addCustomer(newCustomer);
      if (response.id) {
        // Add to local state
        const customerWithId = { ...newCustomer, id: response.id };
        setCustomers([...customers, customerWithId]);
        setSelectedCustomer(response.id);
        setShowAddCustomer(false);
        e.target.reset();
        setMessage('Customer added successfully!');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setMessage('Error adding customer. Please try again.');
    }
  };

  // Invoice management
  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  };

  const saveInvoice = async () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      setMessage('Please select a customer and add items to the invoice.');
      return;
    }

    setSaving(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomer);
      const invoiceData = {
        invoice_number: generateInvoiceNumber(),
        customer_id: selectedCustomer,
        customer_name: customer.name,
        items: invoiceItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            product_id: item.productId,
            product_name: product ? product.name : 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
            total: item.total
          };
        }),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        status: 'completed',
        date: new Date().toISOString().split('T')[0]
      };

      const response = await api.addSale(invoiceData);
      if (response.id) {
        setMessage('Invoice saved successfully!');
        // Reset form
        setSelectedCustomer('');
        setInvoiceItems([]);
        setShowInvoicePreview(false);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setMessage('Error saving invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const exportPDF = () => {
    // Placeholder for PDF export functionality
    setMessage('PDF export feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Invoice Creation
          </h1>
          <p className="text-gray-600 text-lg">Create and manage sales invoices for your customers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInvoicePreview(true)}
            disabled={invoiceItems.length === 0}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Invoice
          </button>
          <button
            onClick={saveInvoice}
            disabled={!selectedCustomer || invoiceItems.length === 0 || saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
          <button
            onClick={() => setMessage('')}
            className="float-right text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Customer Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Choose a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  {(() => {
                    const customer = customers.find(c => c.id === selectedCustomer);
                    return customer ? (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{customer.name}</h4>
                        <p className="text-sm text-gray-600">📞 {customer.phone}</p>
                        <p className="text-sm text-gray-600">📧 {customer.email}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <button
                onClick={() => setShowAddCustomer(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add New Customer
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Invoice Items
              </h3>
              <button
                onClick={addItem}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ₹{product.price} (Stock: {product.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total (₹)</label>
                        <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-purple-600">
                          {item.total.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {invoiceItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No items added to invoice</p>
                  <p className="text-sm text-gray-400">Click "Add Item" to start building your invoice</p>
                </div>
              )}
            </div>

            {/* Invoice Summary */}
            {invoiceItems.length > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Invoice Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-semibold">₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ₹{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Add New Customer
            </h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Vyapar Pro
                  </h2>
                  <p className="text-gray-600">Your Trusted Business Partner</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-600">Invoice #: {generateInvoiceNumber()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                  {(() => {
                    const customer = customers.find(c => c.id === selectedCustomer);
                    return customer ? (
                      <div className="text-gray-600">
                        <p className="font-medium">{customer.name}</p>
                        <p>{customer.phone}</p>
                        <p>{customer.email}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No customer selected</p>
                    );
                  })()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">From:</h4>
                  <div className="text-gray-600">
                    <p className="font-medium">Your Shop Name</p>
                    <p>Shop Address Line 1</p>
                    <p>City, State - PIN</p>
                    <p>Phone: 9876543210</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-blue-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Item</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Quantity</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-3">{product ? product.name : 'Unknown Product'}</td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 font-semibold">₹{item.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-right">
                <div className="inline-block text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold ml-8">₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%):</span>
                      <span className="font-semibold ml-8">₹{calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-8">
                          ₹{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-gray-600">
                <p>Thank you for your business!</p>
                <p className="text-sm">Payment is due within 30 days</p>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowInvoicePreview(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
                <button
                  onClick={printInvoice}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Print Invoice
                </button>
                <button
                  onClick={exportPDF}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices; 