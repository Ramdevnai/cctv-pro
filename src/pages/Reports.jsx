import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('7days');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesResponse, productsResponse, customersResponse] = await Promise.all([
        api.getSales(),
        api.getProducts(),
        api.getCustomers()
      ]);
      
      setSales(salesResponse.sales || []);
      setProducts(productsResponse.products || []);
      setCustomers(customersResponse.customers || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily sales data
  const getDailySales = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySales = sales.filter(sale => sale.date === dateStr);
      const totalSales = daySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const uniqueCustomers = new Set(daySales.map(sale => sale.customer_id)).size;
      
      last7Days.push({
        date: dateStr,
        sales: totalSales,
        orders: daySales.length,
        customers: uniqueCustomers
      });
    }
    return last7Days;
  };

  // Calculate top products
  const getTopProducts = () => {
    const productSales = {};
    
    sales.forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { sales: 0, revenue: 0 };
          }
          productSales[item.product_name].sales += item.quantity || 0;
          productSales[item.product_name].revenue += item.total || 0;
        });
      }
    });

    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate top customers
  const getTopCustomers = () => {
    const customerSales = {};
    
    sales.forEach(sale => {
      if (!customerSales[sale.customer_name]) {
        customerSales[sale.customer_name] = { purchases: 0, orders: 0 };
      }
      customerSales[sale.customer_name].purchases += sale.total || 0;
      customerSales[sale.customer_name].orders += 1;
    });

    return Object.entries(customerSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, 5);
  };

  const dailySales = getDailySales();
  const topProducts = getTopProducts();
  const topCustomers = getTopCustomers();

  const totalRevenue = dailySales.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0);
  const totalCustomers = dailySales.reduce((sum, day) => sum + day.customers, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const getTopPerformingDay = () => {
    return dailySales.reduce((max, day) => day.sales > max.sales ? day : max);
  };

  const exportCSV = () => {
    let csvContent = '';
    
    if (reportType === 'daily') {
      csvContent = [
        'Date,Sales,Orders,Customers',
        ...dailySales.map(day => `${day.date},${day.sales},${day.orders},${day.customers}`)
      ].join('\n');
    } else if (reportType === 'products') {
      csvContent = [
        'Product,Sales Quantity,Revenue',
        ...topProducts.map(product => `${product.name},${product.sales},${product.revenue}`)
      ].join('\n');
    } else if (reportType === 'customers') {
      csvContent = [
        'Customer,Purchases,Orders',
        ...topCustomers.map(customer => `${customer.name},${customer.purchases},${customer.orders}`)
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setMessage('CSV exported successfully!');
  };

  const exportPDF = () => {
    setMessage('PDF export feature coming soon!');
  };

  const syncToGoogleDrive = async () => {
    setLoading(true);
    try {
      const response = await api.syncAll({ sales, products, customers });
      if (response.message) {
        setMessage('Data synced to Google Drive successfully!');
      }
    } catch (error) {
      console.error('Error syncing to Google Drive:', error);
      setMessage('Error syncing to Google Drive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
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
            Sales Reports
          </h1>
          <p className="text-gray-600 text-lg">Analyze your business performance with detailed reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Export PDF
          </button>
          <button
            onClick={syncToGoogleDrive}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync to Google Drive'}
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

      {/* Report Controls */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="daily">Daily Sales Report</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Analysis</option>
              <option value="products">Product Performance</option>
              <option value="customers">Customer Analysis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ₹{totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ₹{Math.round(averageOrderValue).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Daily Sales Trend
        </h3>
        {dailySales.length > 0 ? (
          <div className="space-y-4">
            {dailySales.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                    {new Date(day.date).getDate()}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-600">{day.orders} orders • {day.customers} customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">₹{day.sales.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(day.sales / Math.max(...dailySales.map(d => d.sales), 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{Math.round((day.sales / Math.max(...dailySales.map(d => d.sales), 1)) * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No sales data available</p>
            <p className="text-sm text-gray-400">Create some sales to see your daily trends</p>
          </div>
        )}
      </div>

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Top Performing Products
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">₹{product.revenue.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(product.revenue / Math.max(...topProducts.map(p => p.revenue), 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round((product.revenue / Math.max(...topProducts.map(p => p.revenue), 1)) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No product sales data available</p>
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Top Customers
          </h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹{customer.purchases.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(customer.purchases / Math.max(...topCustomers.map(c => c.purchases), 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{Math.round((customer.purchases / Math.max(...topCustomers.map(c => c.purchases), 1)) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No customer data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Performance Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-2">Best Performing Day</h4>
            {dailySales.length > 0 ? (
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {new Date(getTopPerformingDay().date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-600">₹{getTopPerformingDay().sales.toFixed(2)} in sales</p>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <h4 className="font-semibold text-gray-900 mb-2">Average Daily Revenue</h4>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{(totalRevenue / Math.max(dailySales.length, 1)).toFixed(2)}
            </p>
            <p className="text-gray-600">Over the last {dailySales.length} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports; 