/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '../components/ui/sonner';
import { AuthProvider } from './AuthContext';
import { MedicineProvider } from './MedicineContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { DoctorsListing } from './components/DoctorsListing';
import { DepartmentsListing } from './components/DepartmentsListing';
import { PatientDashboard } from './components/PatientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { Pharmacy } from './components/Pharmacy/Pharmacy';
import { Lab } from './components/Lab/Lab';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <AuthProvider>
      <MedicineProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/departments" element={<DepartmentsListing />} />
                <Route path="/doctors" element={<DoctorsListing />} />
                <Route path="/pharmacy/*" element={<Pharmacy />} />
                <Route path="/lab/*" element={<Lab />} />
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
            </main>
            <footer className="border-t bg-white py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 text-sm">
                  &copy; 2026 ArogyaLink Hospital. All rights reserved.
                </div>
                <div className="flex gap-8 text-sm font-medium text-slate-600">
                  <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
                  <a href="mailto:support@arogyalink.com" className="hover:text-emerald-600 transition-colors">Support</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </Router>
      </MedicineProvider>
    </AuthProvider>
  );
}

