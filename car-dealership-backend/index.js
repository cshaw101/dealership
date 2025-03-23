const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://eizaaizbmoykhlxvkctv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemFhaXpibW95a2hseHZrY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDY5MzMsImV4cCI6MjA1ODI4MjkzM30.VlhSFOC5gfzD_UBGLhmWi-MS1j1YLZ3Ml5LDxRgOWRU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all cars (public endpoint)
app.get('/api/cars', async (req, res) => {
  const { make, minYear, maxYear, minPrice, maxPrice, sort } = req.query;
  let query = supabase.from('cars').select('*');
  if (make) query = query.ilike('make', `%${make}%`);
  if (minYear) query = query.gte('year', parseInt(minYear));
  if (maxYear) query = query.lte('year', parseInt(maxYear));
  if (minPrice) query = query.gte('price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
  if (sort) {
    const [field, direction] = sort.split('_');
    const sortField = field === 'price' ? 'price' : 'year';
    const sortDirection = direction === 'asc' ? 'asc' : 'desc';
    query = query.order(sortField, { ascending: sortDirection === 'asc' });
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching cars:', error);
    return res.status(500).json({ error: 'Error fetching cars' });
  }
  res.json(data);
});

// Fetch a single car by ID (public endpoint)
app.get('/api/cars/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Get authenticated user info
app.get('/api/user', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, name, role')
    .eq('id', data.user.id)
    .single();

  if (profileError) return res.status(403).json({ error: 'User profile not found' });

  res.json({ id: data.user.id, email: profile.email, name: profile.name, role: profile.role });
});

// Sign up a new user
app.post('/api/signup', async (req, res) => {
  const { email, password, name, role } = req.body;
  const validRoles = ['admin', 'manager', 'associate'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(500).json({ error });

  const { error: profileError } = await supabase.from('profiles').insert([
    { id: data.user.id, email, name, role }
  ]);
  if (profileError) return res.status(500).json({ error: profileError });

  res.json({ message: 'User created successfully', userId: data.user.id });
});

// Temporary login endpoint for testing
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  res.json({ token: data.session.access_token });
});

// Add a car (Admin, Manager, Associate)
app.post('/api/admin/cars', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager', 'associate'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  }

  const { make, model, year, price, description, image_url, mileage } = req.body;
  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const carData = {
    make,
    model,
    year,
    price,
    description: description || "",
    image_url,
    mileage: mileage !== undefined && mileage !== null ? mileage : 0,
  };

  const { data, error } = await supabase.from('cars').insert([carData]).select();
  if (error) {
    console.error('Error inserting car:', error);
    return res.status(500).json({ error: 'Error inserting car' });
  }
  res.json(data);
});

// Delete a car (Admin, Manager, Associate)
app.delete('/api/admin/cars/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager', 'associate'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  }

  const { id } = req.params;
  const { error: deleteError } = await supabase.from('cars').delete().eq('id', id);
  if (deleteError) return res.status(500).json({ error: deleteError });

  res.json({ message: 'Car deleted successfully' });
});

// Delete a manager (Admin only)
app.delete('/api/admin/managers/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }

  const { id } = req.params;
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) return res.status(500).json({ error });

  res.json({ message: 'Manager deleted' });
});

// Add an associate (Admin, Manager)
app.post('/api/managers/sales_associates', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied: Admins or Managers only' });
  }

  const { email, password, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(500).json({ error });

  await supabase.from('profiles').insert([{ id: data.user.id, email, name, role: 'associate' }]);
  res.json({ message: 'Associate added successfully' });
});

// Delete an associate (Admin, Manager)
app.delete('/api/managers/associates/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied: Admins or Managers only' });
  }

  const { id } = req.params;
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) return res.status(500).json({ error });

  res.json({ message: 'Associate deleted' });
});

// Fetch all employees (Admin and Manager only)
app.get('/api/employees', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !['admin', 'manager'].includes(profile.role)) {
    return res.status(403).json({ error: 'Access denied: Admins or Managers only' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .neq('id', userData.user.id); // Exclude the current user

  if (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({ error: 'Error fetching employees' });
  }
  res.json(data);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));