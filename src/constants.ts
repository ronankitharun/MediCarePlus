import { Department, Doctor } from './types';

export const DEPARTMENTS: Department[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Our Cardiology department offers comprehensive heart care, from preventive screenings to advanced treatments for complex cardiovascular conditions using state-of-the-art diagnostic technology.',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Specializing in the diagnosis and treatment of all categories of conditions and disease involving the central and peripheral nervous systems, including brain, spinal cord, and cranial nerves.',
    icon: 'Brain',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    description: 'Expert care for musculoskeletal system issues. We specialize in joint replacement, sports medicine, and spinal surgery to help you regain mobility and live a pain-free life.',
    icon: 'Bone',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    description: 'Providing compassionate healthcare for infants, children, and adolescents. Our pediatricians focus on physical, emotional, and social health from birth through young adulthood.',
    icon: 'Baby',
    image: 'https://images.unsplash.com/photo-1581594634750-7df052118023?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    description: 'Advanced medical and cosmetic dermatology services. We treat a wide range of skin, hair, and nail conditions, ensuring your skin remains healthy and vibrant.',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=800',
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-sai',
    name: 'Dr. Sai Theja Bammidi',
    specialty: 'Orthopedic Surgeon',
    departmentId: 'orthopedics',
    experience: 3,
    education: 'MD - Neurology, AIIMS',
    bio: 'Expert in sports medicine and joint replacement surgeries.',
    image: '/dr-sai.jpg',
    availability: {
      'Tuesday': ['10:00', '11:00', '12:00', '15:00'],
      'Thursday': ['09:00', '10:00', '11:00', '14:00'],
    },
  },
];
