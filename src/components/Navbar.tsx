import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '../../components/ui/button';
import { Heart, User, LogOut, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    console.log('Attempting login...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Login successful:', result.user.uid);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Firebase Auth. Please add it to the authorized domains in Firebase Console.');
        console.error('Unauthorized domain. Current domain:', window.location.hostname);
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { to: '/departments', label: 'Departments' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/pharmacy', label: 'Pharmacy' },
    ...(user ? [{ to: '/dashboard', label: 'My Appointments' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:bg-slate-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Arogya<span className="text-emerald-600">Link</span></span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-semibold text-slate-900">{user.displayName}</span>
                <span className="text-xs text-slate-500 capitalize">{user.role}</span>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-slate-600" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100">
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-slate-900/40 backdrop-blur-[2px] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 top-16 z-50 w-3/4 max-w-xs bg-white border-r border-slate-100 p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-6">
                {user && (
                  <div className="flex items-center gap-3 border-b pb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.displayName}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-3 text-lg font-medium text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
