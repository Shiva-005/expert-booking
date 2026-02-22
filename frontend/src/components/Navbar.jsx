import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Expert<span>Connect</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Experts
          </Link>
          <Link to="/my-bookings" className={`nav-link ${pathname === '/my-bookings' ? 'active' : ''}`}>
            My Bookings
          </Link>
        </div>
      </div>
    </nav>
  );
}
