const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = 'https://pbfeehevtkmdlopdbkek.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZmVlaGV2dGttZGxvcGRia2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MzAyMjAsImV4cCI6MjA1ODAwNjIyMH0.L327f3DXczNGTCljmAOAVTI8pOXz38Cc9lo2Wze98vY'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all cars
app.get('/api/cars', async (req, res) => {
  const { make, minYear, maxYear, minPrice, maxPrice, sort } = req.query;
  let query = supabase.from('cars').select('*');

  // Apply filters
  if (make) query = query.ilike('make', `%${make}%`);
  if (minYear) query = query.gte('year', minYear);
  if (maxYear) query = query.lte('year', maxYear);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);

  // Apply sorting
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  if (sort === 'price_desc') query = query.order('price', { ascending: false });
  if (sort === 'year_asc') query = query.order('year', { ascending: true });
  if (sort === 'year_desc') query = query.order('year', { ascending: false });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error });
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

// Add a new car
app.post('/api/cars', async (req, res) => {
  const { make, model, year, price, image_url } = req.body;
  const { data, error } = await supabase
    .from('cars') // Use the correct table name
    .insert([{ make, model, year, price, image_url }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/admin/cars', async (req, res) => {
  const { make, model, year, price, image_url } = req.body;

  // Validate input (optional but recommended)
  if (!make || !model || !year || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('cars')
    .insert([{ make, model, year, price, image_url }]);

  if (error) return res.status(500).json({ error });
  res.json(data);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));