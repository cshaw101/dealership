import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error('Error fetching car details:', error);
      }
    };
    fetchCar();
  }, [id]);

  if (!car) return <p>Loading...</p>;

  return (
    <div className="car-details">
      <h1>{car.make} {car.model}</h1>
      <img src={car.image_url} alt={`${car.make} ${car.model}`} />
      <p>Year: {car.year}</p>
      <p>Price: ${car.price.toLocaleString()}</p>
      <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
};

export default CarDetails;