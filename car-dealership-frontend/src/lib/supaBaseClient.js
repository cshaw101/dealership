import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eizaaizbmoykhlxvkctv.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpemFhaXpibW95a2hseHZrY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDY5MzMsImV4cCI6MjA1ODI4MjkzM30.VlhSFOC5gfzD_UBGLhmWi-MS1j1YLZ3Ml5LDxRgOWRU'
export const supabase = createClient(supabaseUrl, supabaseKey);