import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../../firebaseConfig';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';
import Login from './Login'; // Import Login component
import Register from './Register'; // Import Register component
import './Dashboard.css';

const Dashboard = ({ setProducts, products }) => {
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [soldProducts, setSoldProducts] = useState([]);

  // Managing login and register states inside Dashboard
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const productsRef = ref(database, 'products/');

    const fetchData = () => {
      try {
        onValue(productsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const productList = Object.values(data).map((product, index) => ({
              id: Object.keys(data)[index],
              ...product,
            }));

            // Remove duplicates based on `id`
            const uniqueProducts = productList.filter((value, index, self) =>
              index === self.findIndex((t) => t.id === value.id) // Filter duplicates by unique `id`
            );

            setProducts(uniqueProducts); // Set unique products to state
            // Filter sold products
            setSoldProducts(uniqueProducts.filter((product) => product.sold > 0));
          } else {
            setProducts([]);
            setSoldProducts([]);
          }
        });
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data from Firebase: ', error);
      }
    };

    fetchData();

    return () => {
      setProducts([]); // Clean up products when component unmounts
      setSoldProducts([]);
    };
  }, [setProducts]);

  // Function to handle selling product (when user clicks 'Sell')
  const handleSellProduct = (id, quantitySold) => {
    const productRef = ref(database, `products/${id}`);
    const product = products.find((p) => p.id === id);
    if (product) {
      const updatedProduct = {
        ...product,
        quantity: product.quantity - quantitySold, // Update quantity
        sold: product.sold + quantitySold, // Update sold count
      };

      update(productRef, updatedProduct); // Update product in Firebase
    }
  };

  const renderTabContent = () => {
    if (!loggedIn) {
      // If not logged in, show Login or Register based on the active tab
      if (activeTab === 'login') {
        return <Login setLoggedIn={setLoggedIn} setIsRegistering={setIsRegistering} setActiveTab={setActiveTab} />;
      }
      if (activeTab === 'register') {
        return <Register setIsRegistering={setIsRegistering} />;
      }
    }

    switch (activeTab) {
      case 'home':
        return (
          <div>
            <h2>Welcome to the Admin Dashboard!</h2>
            <p>Use the tabs to navigate between sections like Register, Login, and more.</p>
          </div>
        );
      case 'add-products':
        return <ProductForm setProducts={setProducts} />;
      case 'view-products':
        return (
          <div className="product-list">
            {products.length > 0 ? (
              <div>
                <h3>Product List</h3>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSellProduct={handleSellProduct}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No products available</p>
            )}

            {/* Sold Products Table */}
            {soldProducts.length > 0 && (
              <div>
                <h3>Sold Products</h3>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>${product.price}</td>
                        <td>{product.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return <div>Select a Tab</div>;
    }
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        {/* Home Tab */}
        <button
          className={activeTab === 'home' ? 'active' : ''}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>

        {/* Only show Register and Login tabs after Home tab is active */}
        {activeTab === 'home' && !loggedIn && (
          <>
            <button
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
            <button
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
          </>
        )}

        {/* Only show Add Products and View Products tabs after login */}
        {loggedIn && (
          <>
            <button
              className={activeTab === 'add-products' ? 'active' : ''}
              onClick={() => setActiveTab('add-products')}
            >
              Add Products
            </button>
            <button
              className={activeTab === 'view-products' ? 'active' : ''}
              onClick={() => setActiveTab('view-products')}
            >
              View Products
            </button>
          </>
        )}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Dashboard;
