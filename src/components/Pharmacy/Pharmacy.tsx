import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MedicineListing } from './MedicineListing';
import { MedicineDetails } from './MedicineDetails';
import { MedicineCart } from './MedicineCart';
import { MedicineCheckout } from './MedicineCheckout';

export const Pharmacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 shadow-inner">
      <Routes>
        <Route index element={<MedicineListing />} />
        <Route path=":id" element={<MedicineDetails />} />
        <Route path="cart" element={<MedicineCart />} />
        <Route path="checkout" element={<MedicineCheckout />} />
      </Routes>
    </div>
  );
};
