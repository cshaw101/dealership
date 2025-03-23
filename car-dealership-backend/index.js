const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://eizaaizbmoykhlxvkctv.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemFhaXpibW95a2hseHZrY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDY5MzMsImV4cCI6MjA1ODI4MjkzM30.VlhSFOC5gfzD_UBGLhmWi-MS1j1YLZ3Ml5LDxRgOWRU'
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all cars
app.get('/api/cars', async (req, res) => {
  // Your logic for fetching cars goes here
  const { data, error } = await supabase.from('cars').select('*');

  if (error) {
    return res.status(500).json({ error: 'Error fetching cars' });
  }
  res.json(data);
});

app.post('/api/cars', async (req, res) => {
  const { make, model, year, price, image_url, description, mileage } = req.body;
  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const carData = { make, model, year, price, description, image_url, mileage };
  const { data, error } = await supabase.from('cars').insert([carData]);

  if (error) {
    return res.status(500).json({ error: 'Error inserting car' });
  }
  res.json(data);
});

app.get('/api/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/cars', async (req, res) => {
  const { make, model, year, price, image_url, description, mileage } = req.body;

  console.log(req.body);  // Log the request body for debugging

  // Validate required fields
  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Missing required fields: make, model, year, or price' });
  }

  // Insert car data with defaults for missing fields
  const carData = {
    make,
    model,
    year,
    price,
    description: description || "",  // Default to an empty string if description is missing
    image_url,
    mileage: mileage != null ? mileage : 0,  // Default mileage to 0 if missing
  };

  const { data, error } = await supabase.from('cars').insert([carData]);

  if (error) {
    console.error('Error inserting car:', error);  // Log error for debugging
    return res.status(500).json({ error });
  }

  res.json(data);  // Send back the inserted data
});

app.get('/api/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError) return res.status(403).json({ error: 'User profile not found' });

  res.json({ id: data.user.id, role: profile.role });
});

app.post('/api/signup', async (req, res) => {
  const { email, password, role } = req.body;

  // Ensure role is valid
  const validRoles = ['admin', 'manager', 'sales_associate'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(500).json({ error });

  // Store role in profiles table
  const { error: profileError } = await supabase.from('profiles').insert([
    { id: data.user.id, role }
  ]);

  if (profileError) return res.status(500).json({ error: profileError });

  res.json({ message: 'User created successfully', userId: data.user.id });
});

app.post('/api/admin/cars', async (req, res) => {
  const { make, model, year, price, description, image_url, mileage } = req.body;

  console.log("Received car data:", req.body);  // Log the received data for debugging

  // Validate required fields
  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const carData = {
    make,
    model,
    year,
    price,
    description: description || "",  // Default to an empty string if description is missing
    image_url,
    mileage: mileage !== undefined && mileage !== null ? mileage : 0,  // Default mileage to 0 if missing
  };

  const { data, error } = await supabase.from('cars').insert([carData]);

  if (error) {
    console.error('Error inserting car:', error);  // Log error for debugging
    return res.status(500).json({ error });
  }

  res.json(data);  // Send back the inserted data
});

app.delete('/api/admin/managers/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Delete manager
  const { id } = req.params;
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) return res.status(500).json({ error });

  res.json({ message: 'Manager deleted' });
});

app.post('/api/managers/sales_associates', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Create new Sales Associate
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(500).json({ error });

  await supabase.from('profiles').insert([{ id: data.user.id, role: 'sales_associate' }]);
  res.json({ message: 'Sales Associate added' });
});


app.post('/api/sales/cars', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager', 'sales_associate'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Add car to inventory
  const { make, model, year, price, image_url } = req.body;
  const { error } = await supabase.from('cars').insert([{ make, model, year, price, image_url }]);
  if (error) return res.status(500).json({ error });

  res.json({ message: 'Car added' });
});


app.put('/api/sales/cars/:id/request_delete', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || profile.role !== 'sales_associate') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Request deletion
  const { id } = req.params;
  const { error } = await supabase.from('cars').update({ delete_requested: true }).eq('id', id);
  if (error) return res.status(500).json({ error });

  res.json({ message: 'Car marked for deletion' });
});


// Delete a car (only for admin users)
app.delete('/api/admin/cars/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Get authenticated user
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  // Fetch role from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Delete car
  const { id } = req.params;
  const { error: deleteError } = await supabase.from('cars').delete().eq('id', id);

  if (deleteError) return res.status(500).json({ error: deleteError });

  res.json({ message: 'Car deleted successfully' });
});








const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));