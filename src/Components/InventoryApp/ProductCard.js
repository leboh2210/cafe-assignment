import React, { useState } from 'react';
import { ref, update, remove } from 'firebase/database';
import { database } from '../../firebaseConfig'; 
import './ProductCard.css'; 

const ProductCard = ({ product, onSellProduct }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);
  const [isSelling, setIsSelling] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(0);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const productRef = ref(database, `products/${product.id}`);
      await update(productRef, editedProduct);
      alert('Product updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product: ', error);
      alert('Failed to update product.');
    }
  };

  const handleSell = () => {
    const quantityToSell = parseInt(sellQuantity, 10);

    if (isNaN(quantityToSell) || quantityToSell <= 0 || quantityToSell > product.quantity) {
      alert('Please enter a valid quantity to sell.');
      return;
    }

    const newSoldQuantity = product.sold ? product.sold + quantityToSell : quantityToSell;
    const newProductQuantity = product.quantity - quantityToSell;

    if (isNaN(newProductQuantity) || newProductQuantity < 0) {
      alert('Invalid product quantity after sale.');
      return;
    }

    const updatedProduct = {
      ...product,
      sold: newSoldQuantity,
      quantity: newProductQuantity,
    };

    const productRef = ref(database, `products/${product.id}`);
    update(productRef, updatedProduct)
      .then(() => {
        alert(`Successfully sold ${quantityToSell} product(s)!`);
        setSellQuantity(0);
        setIsSelling(false);
      })
      .catch((error) => {
        console.error('Error updating product quantity: ', error);
        alert('Failed to update product.');
      });
  };

  const handleRemove = () => {
    const productRef = ref(database, `products/${product.id}`);
    remove(productRef)
      .then(() => {
        alert('Product removed successfully!');
      })
      .catch((error) => {
        console.error('Error removing product: ', error);
        alert('Failed to remove product.');
      });
  };

  return (
    <tr className="product-card">
      {!isEditing ? (
        <>
          <td>{product.name}</td>
          <td>{product.description}</td>
          <td>${product.price}</td>
          <td>{product.quantity}</td>
          <td>
            <button onClick={handleEditToggle}>Edit</button>
            <button onClick={handleRemove}>Remove</button>
            <button onClick={() => setIsSelling(true)}>Sell</button>
          </td>
        </>
      ) : (
        <>
          <td>
            <input
              type="text"
              name="name"
              value={editedProduct.name || ''}
              onChange={handleInputChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="description"
              value={editedProduct.description || ''}
              onChange={handleInputChange}
            />
          </td>
          <td>
            <input
              type="number"
              name="price"
              value={editedProduct.price || ''}
              onChange={handleInputChange}
            />
          </td>
          <td>
            <input
              type="number"
              name="quantity"
              value={editedProduct.quantity || ''}
              onChange={handleInputChange}
            />
          </td>
          <td>
            <button onClick={handleSaveEdit}>Save</button>
            <button onClick={handleEditToggle}>Cancel</button>
          </td>
        </>
      )}

      {isSelling && (
        <td colSpan="5" className="sell-section">
          <input
            type="number"
            value={sellQuantity}
            onChange={(e) => setSellQuantity(Number(e.target.value))}
            placeholder="Enter quantity to sell"
            min="1"
            max={product.quantity}
          />
          <button onClick={handleSell}>Confirm Sell</button>
          <button onClick={() => setIsSelling(false)}>Cancel</button>
        </td>
      )}
    </tr>
  );
};

export default ProductCard;
