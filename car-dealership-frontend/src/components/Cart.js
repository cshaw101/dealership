import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, totalPrice } = useContext(CartContext);

  return (
    <div className="cart">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((car) => (
              <li key={car.id}>
                <h2>{car.make} {car.model}</h2>
                <p>Year: {car.year}</p>
                <p>Price: ${car.price.toLocaleString()}</p>
                <button onClick={() => removeFromCart(car.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${totalPrice.toLocaleString()}</h3>
        </>
      )}
    </div>
  );
};

export default Cart;