import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
        <p>
          Browse through our diverse range of meticulously crafted garments,
          designed to bring out your individuality and cater to your sense of
          style.
        </p>
        <Link to="/categories/all" className="btn btn-primary btn-large">
          Shop Now
        </Link>

        <div className="hero-stats">
          <div>
            <h3>200+</h3>
            <p>International Brands</p>
          </div>
          <div>
            <h3>2,000+</h3>
            <p>High-Quality Products</p>
          </div>
          <div>
            <h3>30,000+</h3>
            <p>Happy Customers</p>
          </div>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80"
          alt="Fashion models wearing the latest styles"
        />
      </div>
    </section>
  );
}
