import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [loading, setLoading] = useState(false);

  const fetchCars = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [makeFilter, minYear, maxYear, minPrice, maxPrice, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCars]);

  const filteredMakes = useMemo(() => {
    if (makeFilter) {
      return cars
        .map((car) => car.make)
        .filter((make, index, self) => self.indexOf(make) === index)
        .filter((make) => make.toLowerCase().includes(makeFilter.toLowerCase()));
    }
    return [];
  }, [makeFilter, cars]);

  useEffect(() => {
    setSuggestions(filteredMakes);
  }, [filteredMakes]);

  const handleSuggestionClick = (make) => {
    setMakeFilter(make);
    setSuggestions([]);
  };

  const isValidNumber = (value) => !isNaN(value) && value >= 0;

  return (
    <div className="car-list">
      <div className="filters">
        <div className="make-filter">
          <input
            type="text"
            placeholder="Filter by Make"
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
          placeholder="Min Year"
          value={minYear}
          onChange={(e) => isValidNumber(e.target.value) && setMinYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Year"
          value={maxYear}
          onChange={(e) => isValidNumber(e.target.value) && setMaxYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => isValidNumber(e.target.value) && setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => isValidNumber(e.target.value) && setMaxPrice(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="year_asc">Year: Old to New</option>
          <option value="year_desc">Year: New to Old</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading vehicles...</p>
      ) : cars.length === 0 ? (
        <p className="no-results">No cars found with these filters.</p>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarList;