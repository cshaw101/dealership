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
        navigate('/login');
      } else {
        setUser(user);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isNaN(parseInt(mileage)) || parseInt(mileage) < 0) {
      setMessage('Please enter a valid mileage number.');
      return;
    }
  
    const carData = {
      make,
      model,
      year: parseInt(year),
      price: parseFloat(price),
      mileage: mileage ? parseInt(mileage) : 0,
      description: description || '',
      image_url: imageUrl,
    };
  
    console.log("Car data being sent:", carData);
  
    try {
      await axios.post('http://localhost:5001/api/admin/cars', carData);
      setMessage('Car added successfully!');
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
      <div className="dashboard-header">
        <h1>Car Dealership Admin Dashboard</h1>
        {user && <p className="welcome-text">Welcome, {user.email}!</p>}
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
      <div className="dashboard-content">
        <div className="add-car-card">
          <h2>Add New Vehicle</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Make (e.g., Toyota)"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Model (e.g., Camry)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Year (e.g., 2023)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Price (e.g., 25000)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Mileage (e.g., 15000)"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Description (e.g., Fully loaded, one owner)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <button type="submit" className="submit-btn">Add Car</button>
          </form>
          {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e2a44 0%, #2c3e50 100%);
          padding: 20px;
          font-family: 'Arial', sans-serif;
          color: #fff;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          color: #fff;
        }

        .welcome-text {
          margin: 0;
          font-size: 16px;
          color: #d1d8e0;
        }

        .logout-btn {
          padding: 10px 20px;
          background-color: #e74c3c;
          border: none;
          border-radius: 5px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .logout-btn:hover {
          background-color: #c0392b;
        }

        .dashboard-content {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .add-car-card {
          background: #fff;
          color: #2c3e50;
          padding: 30px;
          border-radius: 10px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .add-car-card h2 {
          margin: 0 0 20px;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #dcdcdc;
          border-radius: 5px;
          font-size: 16px;
          color: #2c3e50;
          background: #f9f9f9;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #3498db;
          outline: none;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #3498db;
          border: none;
          border-radius: 5px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .submit-btn:hover {
          background-color: #2980b9;
        }

        .message {
          margin-top: 20px;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          font-size: 14px;
        }

        .message.success {
          background-color: #2ecc71;
          color: #fff;
        }

        .message.error {
          background-color: #e74c3c;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;