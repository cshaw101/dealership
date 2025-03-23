import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supaBaseClient';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login'); // Redirect to login if not authenticated
      } else {
        setUser(user);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if mileage is a valid number
    if (isNaN(parseInt(mileage)) || parseInt(mileage) < 0) {
      setMessage('Please enter a valid mileage number.');
      return;
    }
  
    const carData = {
      make,
      model,
      year: parseInt(year),
      price: parseFloat(price),
      mileage: mileage ? parseInt(mileage) : 0,  // Ensure mileage is passed as a valid number
      description: description || '',  // Ensure description is passed correctly
      image_url: imageUrl,
    };
  
    console.log("Car data being sent:", carData); // Log to ensure data is correct
  
    try {
      await axios.post('http://localhost:5001/api/admin/cars', carData);
      setMessage('Car added successfully!');
      // Reset form fields
      setMake('');
      setModel('');
      setYear('');
      setPrice('');
      setMileage('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      setMessage('Error adding car: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {user && <p>Welcome, {user.email}!</p>}
      <button onClick={handleLogout}>Log Out</button>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} required />
        <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required />
        <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="number" placeholder="Mileage" value={mileage} onChange={(e) => setMileage(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <button type="submit">Add Car</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminDashboard;