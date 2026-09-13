import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h3 className="logo">SHOP.CO</h3>
          <p>
            We provide quality fashion for everyone, at prices that make sense.
          </p>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>
              <Link to="/">About</Link>
            </li>
            <li>
              <Link to="/">Careers</Link>
            </li>
            <li>
              <Link to="/">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li>
              <Link to="/">Support</Link>
            </li>
            <li>
              <Link to="/">Delivery Details</Link>
            </li>
            <li>
              <Link to="/">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li>
              <Link to="/categories/men">Men</Link>
            </li>
            <li>
              <Link to="/categories/women">Women</Link>
            </li>
            <li>
              <Link to="/categories/shoes">Shoes</Link>
            </li>
            <li>
              <Link to="/categories/accessories">Accessories</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} SHOP.CO. All rights reserved.</p>
      </div>
    </footer>
  );
}
