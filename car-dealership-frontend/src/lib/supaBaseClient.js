import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbfeehevtkmdlopdbkek.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZmVlaGV2dGttZGxvcGRia2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MzAyMjAsImV4cCI6MjA1ODAwNjIyMH0.L327f3DXczNGTCljmAOAVTI8pOXz38Cc9lo2Wze98vY'; // Replace with your Supabase anon key
export const supabase = createClient(supabaseUrl, supabaseKey);