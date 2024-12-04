import React, { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../../firebaseConfig'; 
import './ProductForm.css';

const ProductForm = ({ setProducts }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !price || !quantity) {
      setError('Please fill in all fields');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    const productRef = ref(database, 'products/');

    // Check if the product already exists (based on name or any unique field)
    const snapshot = await get(productRef);
    const data = snapshot.val();

    // Checking if a product with the same name already exists
    const existingProduct = data && Object.values(data).find((product) => product.name === name);

    if (existingProduct) {
      setError('Product with this name already exists.');
      return; // Prevent adding the duplicate product
    }

    const productId = Date.now().toString();
    const newProductRef = ref(database, 'products/' + productId);

    try {
      await set(newProductRef, {
        id: productId,
        name,
        description,
        price: parsedPrice,
        quantity: parsedQuantity,
      });

      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setError('');

      // Update the UI with the newly added product
      setProducts((prevProducts) => [
        ...prevProducts,
        { id: productId, name, description, price: parsedPrice, quantity: parsedQuantity },
      ]);

      alert('Product added successfully!');
    } catch (err) {
      console.error('Error adding product: ', err);
      setError('Failed to add product');
    }
  };

  return (
    <div className="product-form">
      <h3>Add New Product</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default ProductForm;
