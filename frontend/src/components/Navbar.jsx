import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Home, Grid, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isLoggedIn, logoutUser } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <Film size={24} />
          Cine<span>Verse</span>
        </Link>

        <div className="navbar-links">
          <Link to="/"       className={isActive('/')}>       <Home size={15} style={{marginRight:4,verticalAlign:'middle'}}/>Home</Link>
          <Link to="/movies" className={isActive('/movies')}> <Grid size={15} style={{marginRight:4,verticalAlign:'middle'}}/>Movies</Link>

          {isLoggedIn ? (
            <div className="nav-user">
              <Link to="/profile" className={isActive('/profile')}>
                <User size={15} style={{marginRight:4,verticalAlign:'middle'}}/>
                {user?.username}
              </Link>
              <button className="nav-btn outline" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="nav-btn">
                <LogIn size={14} /> Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
