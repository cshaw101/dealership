import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/admin/cars', {
        make,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        image_url: imageUrl,
      });
      setMessage('Car added successfully!');
      // Clear the form
      setMake('');
      setModel('');
      setYear('');
      setPrice('');
      setImageUrl('');
    } catch (error) {
      setMessage('Error adding car: ' + error.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button type="submit">Add Car</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminDashboard;