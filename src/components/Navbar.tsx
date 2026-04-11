import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '../../components/ui/button';
import { Heart, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MediCare<span className="text-emerald-600">Plus</span></span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/departments" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Departments</Link>
          <Link to="/doctors" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Doctors</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">My Appointments</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Admin Panel</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-semibold text-slate-900">{user.displayName}</span>
                <span className="text-xs text-slate-500 capitalize">{user.role}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100">
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
