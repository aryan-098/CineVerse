import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Login from './pages/Login';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/movies"       element={<Movies />} />
          <Route path="/movies/:id"   element={<MovieDetail />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
