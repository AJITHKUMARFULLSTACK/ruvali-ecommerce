import React, { createContext, useContext, useEffect, useState } from 'react';

const CUSTOMER_TOKEN_KEY = 'customerToken';
const CUSTOMER_DATA_KEY = 'customerData';

const CustomerContext = createContext(null);

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return ctx;
};

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    const storedData = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (storedToken && storedData) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_DATA_KEY);
        return;
      }
      try {
        const data = JSON.parse(storedData);
        setToken(storedToken);
        setCustomer(data);
      } catch {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_DATA_KEY);
      }
    }
  }, []);

  const login = (newToken, customerData) => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, newToken);
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(customerData));
    setToken(newToken);
    setCustomer(customerData);
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_DATA_KEY);
    setToken(null);
    setCustomer(null);
  };

  const value = {
    customer,
    token,
    login,
    logout,
    isLoggedIn: !!customer && !!token
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
