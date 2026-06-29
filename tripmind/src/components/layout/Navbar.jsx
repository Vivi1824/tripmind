import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-slate-900">TripMind 🌍</Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/results" className="text-slate-600 hover:text-slate-900">Results</Link>
              <Link to="/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
              <span className="text-slate-500">{user.email}</span>
              <button onClick={handleLogout} className="rounded-full bg-red-500 px-3 py-1.5 text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}