import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  return (
    <div className="car-card">
      <div className="car-image">
        <img src={car.image_url} alt={`${car.make} ${car.model}`} />
      </div>
      <div className="car-details">
        <h3 className="car-title">{car.make} {car.model}</h3>
        <p className="car-year">Year: {car.year}</p>
        <p className="car-price">${car.price.toLocaleString()}</p>
        <Link to={`/cars/${car.id}`}>
          <button className="view-details-btn">View Details</button>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;