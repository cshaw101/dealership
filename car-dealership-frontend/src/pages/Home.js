import CarList from '../components/CarList';

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header>
        <div className="logo">
          <h1>XAI Auto Dealership</h1>
          <p>Quality Cars, Exceptional Service</p>
        </div>
        <nav>
          <a href="#inventory">Inventory</a>
          <a href="#financing">Financing</a>
          <a href="#contact">Contact Us</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Drive the Future</h2>
          <p>Explore our wide selection of vehicles today!</p>
          <button className="cta-button">Browse Inventory</button>
        </div>
      </section>

      {/* Inventory Section */}
      <section id="inventory" className="inventory-section">
        <h2>Our Featured Inventory</h2>
        <CarList />
      </section>

      {/* Footer Section */}
      <footer className="dealership-footer">
        <p>© 2025 XAI Auto Dealership. All Rights Reserved.</p>
        <p>1234 Auto Lane, Tech City, TX | (555) 123-4567 | info@xaiauto.com</p>
      </footer>
    </div>
  );
};

export default Home;