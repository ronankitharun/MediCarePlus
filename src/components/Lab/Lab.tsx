import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LabListing } from './LabListing';
import { LabBooking } from './LabBooking';

export const Lab = () => {
  return (
    <Routes>
      <Route path="/" element={<LabListing />} />
      <Route path="/book/:packageId" element={<LabBooking />} />
    </Routes>
  );
};
