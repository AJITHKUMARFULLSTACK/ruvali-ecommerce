import React from 'react';
import { useStore } from '../../context/StoreContext';
import './DebugPanel.css';

const DebugPanel = () => {
  const { storeSlug, store, productCount, lastFetchTime, backendUrl } = useStore();

  if (!store) return null;

  return (
    <div className="debug-panel">
      <div><strong>Store slug:</strong> {storeSlug}</div>
      <div><strong>Store ID:</strong> {store.id}</div>
      <div><strong>Product count:</strong> {productCount}</div>
      <div><strong>Primary color:</strong> {store.primaryColor || 'n/a'}</div>
      <div><strong>Secondary color:</strong> {store.secondaryColor || 'n/a'}</div>
      <div><strong>Last fetch:</strong> {lastFetchTime || 'n/a'}</div>
      <div><strong>Backend URL:</strong> {backendUrl}</div>
    </div>
  );
};

export default DebugPanel;

