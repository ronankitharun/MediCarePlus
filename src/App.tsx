/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '../components/ui/sonner';
import { AuthProvider } from './AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { DoctorsListing } from './components/DoctorsListing';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminPanel } from './components/AdminPanel';

const Departments = () => (
  <div className="container mx-auto px-4 py-20 text-center">
    <h1 className="text-4xl font-bold mb-4">Our Departments</h1>
    <p className="text-slate-600">Browse our specialized medical departments.</p>
    {/* Full departments listing can be added here */}
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/doctors" element={<DoctorsListing />} />
              <Route path="/dashboard" element={<PatientDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
          <footer className="border-t bg-white py-12">
            <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
              &copy; 2026 MediCare Plus Hospital. All rights reserved.
            </div>
          </footer>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

