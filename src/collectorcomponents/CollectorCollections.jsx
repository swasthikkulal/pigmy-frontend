// src/components/CollectorCollections.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Filter, CheckCircle, XCircle, Clock, 
  Eye, ArrowLeft, User, CreditCard, RefreshCw, TrendingUp,
  Calendar, FileText, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CollectorCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [collectorInfo, setCollectorInfo] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalAmount: 0
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('collectorToken');

  useEffect(() => {
    fetchCollectorCollections();
  }, []);

  const fetchCollectorCollections = async () => {
    try {
      setLoading(true);
      
      const paymentsResponse = await axios.get(
        'http://localhost:5000/api/payments/payments',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (paymentsResponse.data.success) {
        const payments = paymentsResponse.data.data || [];
        const apiStats = paymentsResponse.data.stats || {};
        
        console.log('Payments received:', payments);
        console.log('Stats received:', apiStats);
        
        setCollections(payments);
        setStats(apiStats);
        
        // Set collector info from the first payment if available
        if (payments.length > 0 && payments[0].collectorId) {
          setCollectorInfo(payments[0].collectorId);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    setUpdatingStatus(paymentId);
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/payments/${paymentId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update local state
        setCollections(collections.map(collection =>
          collection._id === paymentId 
            ? { ...collection, status: newStatus }
            : collection
        ));
        
        // Refresh stats
        fetchCollectorCollections();
        
        alert(`Payment status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'online':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = 
      collection.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.accountId?.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.customerId?.phone && collection.customerId.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Account', 'Amount', 'Method', 'Status', 'Payment Date'];
    const csvData = filteredCollections.map(collection => [
      new Date(collection.createdAt).toLocaleDateString(),
      collection.customerId?.name || 'N/A',
      collection.customerId?.phone || 'N/A',
      collection.accountId?.accountNumber || 'N/A',
      collection.amount,
      collection.paymentMethod,
      collection.status,
      new Date(collection.paymentDate).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/collector/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  My Collections ({stats.total})
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {collectorInfo && (
                <span className="text-sm text-gray-600 hidden md:block">
                  Collector: {collectorInfo.name} ({collectorInfo.collectorId})
                </span>
              )}
              <button
                onClick={exportToCSV}
                className="flex items-center text-green-600 hover:text-green-800"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </button>
              <button
                onClick={fetchCollectorCollections}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, account number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collections List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No collections found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria.' 
                  : 'No payment collections found for your accounts yet.'
                }
              </p>
              <button
                onClick={fetchCollectorCollections}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer & Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.map((collection) => (
                    <tr key={collection._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {collection.customerId?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {collection.customerId?.phone || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">
                              Acc: {collection.accountId?.accountNumber || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {collection.accountId?.accountType || 'N/A'} • ₹{collection.accountId?.dailyAmount}/week
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{collection.amount}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          {getPaymentMethodIcon(collection.paymentMethod)}
                          <span className="ml-1 capitalize">{collection.paymentMethod}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Paid on: {new Date(collection.paymentDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(collection.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(collection.status)}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleViewDetails(collection)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        
                        {collection.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(collection._id, 'completed')}
                            disabled={updatingStatus === collection._id}
                            className="text-green-600 hover:text-green-900 text-sm disabled:opacity-50"
                          >
                            {updatingStatus === collection._id ? '...' : 'Complete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Collection Detail Modal */}
      {showDetailModal && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Collection Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCollection.customerId?.name || 'N/A'}
                    </h3>
                    <p className="text-gray-600">{selectedCollection.customerId?.phone || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedCollection.customerId?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Account Number:</span>
                    <span className="text-sm text-gray-900">{selectedCollection.accountId?.accountNumber || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Account Type:</span>
                    <span className="text-sm text-gray-900 capitalize">{selectedCollection.accountId?.accountType || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Weekly Amount:</span>
                    <span className="text-sm text-gray-900">₹{selectedCollection.accountId?.dailyAmount || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Payment Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₹{selectedCollection.amount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Payment Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedCollection.paymentDate).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Recorded Date:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedCollection.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                    <span className="text-sm text-gray-900 capitalize flex items-center">
                      {getPaymentMethodIcon(selectedCollection.paymentMethod)}
                      <span className="ml-1">{selectedCollection.paymentMethod}</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className="text-sm text-gray-900">
                      {getStatusBadge(selectedCollection.status)}
                    </span>
                  </div>

                  {selectedCollection.collectorId && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Collector:</span>
                        <span className="text-sm text-gray-900">{selectedCollection.collectorId.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Area:</span>
                        <span className="text-sm text-gray-900">{selectedCollection.collectorId.area}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                {(selectedCollection.status === 'pending') && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedCollection._id, 'completed');
                      setShowDetailModal(false);
                    }}
                    disabled={updatingStatus === selectedCollection._id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                  >
                    {updatingStatus === selectedCollection._id ? '...' : 'Mark Complete'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorCollections;