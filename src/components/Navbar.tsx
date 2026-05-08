import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '../../components/ui/button';
import { Heart, User, LogOut, LayoutDashboard, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMenuOpen(false);
      setIsSettingsOpen(false);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { to: '/doctors', label: 'Doctor Profile' },
    ...(user ? [{ to: '/dashboard', label: 'My Appointments' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Dr. Sai <span className="text-emerald-600">Theja</span></span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!user && (
            <Button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 dark:shadow-none">
              Login
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent text-muted-foreground"
            onClick={() => setIsSettingsOpen(true)}
            id="settings-trigger"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings Side Panel */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-xs bg-background border-l border-border p-6 shadow-2xl"
              id="settings-panel"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-8">
                {user && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50 border border-border">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-7 w-7" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-foreground truncate">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-400" />}
                      <span className="font-medium text-foreground">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>

                {user && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 px-4"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-semibold">Log Out</span>
                    </Button>
                  </div>
                )}

                {!user && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">Sign in to manage your appointments and settings.</p>
                    <Button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base shadow-lg shadow-emerald-200 dark:shadow-none">
                      Login to your account
                    </Button>
                  </div>
                )}
              </div>

              <div className="absolute bottom-8 left-6 right-6">
                <p className="text-center text-xs text-muted-foreground">
                  Dr. Sai Theja Orthopedic Care v1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 top-16 z-50 w-3/4 max-w-xs bg-background border-r border-border p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-6">
                {user && (
                  <div className="flex items-center gap-3 border-b pb-6 border-border">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
