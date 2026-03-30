import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../lib/api';
import { useSyncProvider } from '../hooks/useSyncProvider';

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [providers, setProviders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket sync
  const handleUpdate = useCallback((message) => {
    if (message.type === 'refresh' || message.type === 'update') {
      // Refresh providers when notified
      fetchProviders();
    }
  }, []);

  const { isConnected } = useSyncProvider(handleUpdate);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.providers.list();
      setProviders(res.providers || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      setError(err.message);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.orders.list();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  const createOrder = useCallback(async (items, deliveryAddress) => {
    try {
      const res = await api.orders.create(items, deliveryAddress);
      setOrders((prev) => [...prev, res.order]);
      return res.order;
    } catch (err) {
      console.error('Failed to create order:', err);
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProviders(), fetchOrders()]);
      setLoading(false);
    };
    init();
  }, []);

  // Periodically refresh when WebSocket is connected
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        fetchProviders();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, fetchProviders]);

  const value = {
    providers,
    orders,
    loading,
    error,
    isConnected,
    fetchProviders,
    fetchOrders,
    createOrder,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
