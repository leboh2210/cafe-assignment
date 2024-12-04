import React, { useState, useEffect } from 'react';
import './InventoryApp.css';
import Dashboard from './Dashboard'; // Import Dashboard

const InventoryApp = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1', price: 100, quantity: 10 },
        { id: 2, name: 'Product 2', description: 'Description 2', price: 200, quantity: 5 },
      ];
      setProducts(fetchedProducts);
    };
    fetchProducts();
  }, []);

  return (
    <div className="dashboard-container">
      <Dashboard setProducts={setProducts} products={products} />
    </div>
  );
};

export default InventoryApp;
