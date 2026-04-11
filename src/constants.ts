import { Department, Doctor } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Specialized care for heart and vascular conditions.',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Expert treatment for brain and nervous system disorders.',
    icon: 'Brain',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Comprehensive care for bones, joints, and muscles.',
    icon: 'Bone',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Dedicated healthcare for infants, children, and adolescents.',
    icon: 'Baby',
    image: 'https://images.unsplash.com/photo-1581594634750-7df052118023?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    description: 'Advanced care for skin, hair, and nail conditions.',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800',
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-smith',
    name: 'Dr. Sarah Smith',
    specialty: 'Senior Cardiologist',
    departmentId: 'cardiology',
    experience: 15,
    education: 'MD - Cardiology, Harvard Medical School',
    bio: 'Dr. Smith has over 15 years of experience in treating complex cardiovascular diseases.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=400',
    availability: {
      'Monday': ['09:00', '10:00', '11:00', '14:00', '15:00'],
      'Wednesday': ['09:00', '10:00', '11:00'],
      'Friday': ['14:00', '15:00', '16:00'],
    },
  },
  {
    id: 'dr-johnson',
    name: 'Dr. Michael Johnson',
    specialty: 'Neurologist',
    departmentId: 'neurology',
    experience: 12,
    education: 'MD - Neurology, Johns Hopkins University',
    bio: 'Specializing in neurodegenerative disorders and stroke management.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    availability: {
      'Tuesday': ['10:00', '11:00', '12:00', '15:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00'],
    },
  },
  {
    id: 'dr-williams',
    name: 'Dr. Emily Williams',
    specialty: 'Orthopedic Surgeon',
    departmentId: 'orthopedics',
    experience: 10,
    education: 'MD - Orthopedic Surgery, Stanford University',
    bio: 'Expert in sports medicine and joint replacement surgeries.',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    availability: {
      'Monday': ['13:00', '14:00', '15:00'],
      'Thursday': ['10:00', '11:00', '12:00'],
      'Friday': ['09:00', '10:00', '11:00'],
    },
  },
];
