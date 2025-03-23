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
  const [employees, setEmployees] = useState([]);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('associate');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const response = await axios.get('http://localhost:5001/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        fetchEmployees(token);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchEmployees = async (token) => {
    try {
      const response = await axios.get('http://localhost:5001/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmitCar = async (e) => {
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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await axios.post('http://localhost:5001/api/admin/cars', carData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Car added successfully!');
      setMake('');
      setModel('');
      setYear('');
      setPrice('');
      setMileage('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      setMessage('Error adding car: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await axios.post(
        'http://localhost:5001/api/managers/sales_associates',
        {
          email: newEmployeeEmail,
          password: newEmployeePassword,
          name: newEmployeeName,
          role: newEmployeeRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Employee added successfully!');
      setNewEmployeeEmail('');
      setNewEmployeePassword('');
      setNewEmployeeName('');
      setNewEmployeeRole('associate');
      fetchEmployees(token);
    } catch (error) {
      setMessage('Error adding employee: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteEmployee = async (id) => {
    const employee = employees.find(e => e.id === id);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${employee.name || employee.email} (${employee.role})?`
    );
    if (!confirmDelete) return; // Exit if user cancels

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const endpoint = user.role === 'admin' && employee.role === 'manager'
        ? `/api/admin/managers/${id}`
        : `/api/managers/associates/${id}`;
      await axios.delete(`http://localhost:5001${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Employee deleted successfully!');
      fetchEmployees(token);
    } catch (error) {
      setMessage('Error deleting employee: ' + (error.response?.data?.error || error.message));
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
        {user && <p className="welcome-text">Welcome, {user.name || user.email}!</p>}
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
      <div className="dashboard-content">
        <div className="add-car-card">
          <h2>Add New Vehicle</h2>
          <form onSubmit={handleSubmitCar}>
            <div className="form-group">
              <input type="text" placeholder="Make (e.g., Toyota)" value={make} onChange={(e) => setMake(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Model (e.g., Camry)" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="number" placeholder="Year (e.g., 2023)" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="number" placeholder="Price (e.g., 25000)" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="number" placeholder="Mileage (e.g., 15000)" value={mileage} onChange={(e) => setMileage(e.target.value)} required />
            </div>
            <div className="form-group">
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <button type="submit" className="submit-btn">Add Car</button>
          </form>
        </div>

        <div className="manage-employees-card">
          <h2>Manage Employees</h2>
          <form onSubmit={handleAddEmployee}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Employee Email"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Employee Password"
                value={newEmployeePassword}
                onChange={(e) => setNewEmployeePassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Employee Name"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <select value={newEmployeeRole} onChange={(e) => setNewEmployeeRole(e.target.value)}>
                <option value="associate">Associate</option>
                {user?.role === 'admin' && <option value="manager">Manager</option>}
              </select>
            </div>
            <button type="submit" className="submit-btn">Add Employee</button>
          </form>

          <h3>Current Employees</h3>
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <ul className="employee-list">
              {employees.map((employee) => (
                <li key={employee.id}>
                  {employee.name || employee.email} ({employee.role})
                  {(user.role === 'admin' || (user.role === 'manager' && employee.role === 'associate')) && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}

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
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
        }
        .add-car-card, .manage-employees-card {
          background: #fff;
          color: #2c3e50;
          padding: 30px;
          border-radius: 10px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .add-car-card h2, .manage-employees-card h2 {
          margin: 0 0 20px;
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dcdcdc;
          border-radius: 5px;
          font-size: 16px;
          color: #2c3e50;
          background: #f9f9f9;
          transition: border-color 0.3s;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
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
        .employee-list {
          list-style: none;
          padding: 0;
        }
        .employee-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #dcdcdc;
        }
        .delete-btn {
          padding: 5px 10px;
          background-color: #e74c3c;
          border: none;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .delete-btn:hover {
          background-color: #c0392b;
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