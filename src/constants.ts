import { Department, Doctor, Medicine, LabPackage } from './types';
import drSaiImage from './assets/dr-sai.jpg';

export const DEPARTMENTS: Department[] = [
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Expert care for musculoskeletal system issues. We specialize in joint replacement, sports medicine, and spinal surgery to help you regain mobility and live a pain-free life.',
    icon: 'Bone',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-sai',
    name: 'Dr. Sai Theja Bammidi',
    specialty: 'Orthopedic Surgeon',
    departmentId: 'orthopedics',
    experience: 3,
    education: 'MS - Orthopaedics, AIIMS',
    bio: 'Expert in sports medicine and joint replacement surgeries.',
    image: drSaiImage,
    hospital: 'A One Hospital, Srikakulam, 532001',
    googleMapsUrl: 'https://maps.app.goo.gl/BopSTSxKmbu1QpZs9',
    availability: {
      'Tuesday': ['10:00', '11:00', '12:00', '15:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00'],
    },
  },
];

export const MEDICINES: Medicine[] = [];

export const LAB_PACKAGES: LabPackage[] = [];
