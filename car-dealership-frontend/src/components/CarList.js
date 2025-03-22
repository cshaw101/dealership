import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CarCard from './CarCard';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [makeFilter, setMakeFilter] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Fetch all cars for suggestions
  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/cars');
        setCars(response.data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };
    fetchAllCars();
  }, []);

  // Fetch filtered cars
  const fetchCars = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/cars', {
        params: {
          make: makeFilter,
          minYear,
          maxYear,
          minPrice,
          maxPrice,
          sort,
        },
      });
      setCars(response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  }, [makeFilter, minYear, maxYear, minPrice, maxPrice, sort]);

  // Update suggestions based on makeFilter
  useEffect(() => {
    if (makeFilter) {
      const filteredMakes = cars
        .map((car) => car.make)
        .filter((make, index, self) => self.indexOf(make) === index)
        .filter((make) => make.toLowerCase().includes(makeFilter.toLowerCase()));
      setSuggestions(filteredMakes);
    } else {
      setSuggestions([]);
    }
  }, [makeFilter, cars]);

  // Handle suggestion click
  const handleSuggestionClick = (make) => {
    setMakeFilter(make); // Set the selected make
    setSuggestions([]); // Clear suggestions
  };

  // Apply filters when makeFilter changes
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return (
    <div className="car-list">
      <div className="filters">
        <div className="make-filter">
          <input
            type="text"
            placeholder="Filter by make"
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((make, index) => (
                <li key={index} onClick={() => handleSuggestionClick(make)}>
                  {make}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="number"
          placeholder="Min year"
          value={minYear}
          onChange={(e) => setMinYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max year"
          value={maxYear}
          onChange={(e) => setMaxYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="year_asc">Year: Oldest to Newest</option>
          <option value="year_desc">Year: Newest to Oldest</option>
        </select>
      </div>
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
};

export default CarList;