import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  return (
    <div className="car-card">
      <img src={car.image_url} alt={`${car.make} ${car.model}`} />
      <h2>{car.make} {car.model}</h2>
      <p>Year: {car.year}</p>
      <p>Price: ${car.price.toLocaleString()}</p>
      <Link to={`/cars/${car.id}`}>
        <button>View Details</button>
      </Link>
    </div>
  );
};

export default CarCard;