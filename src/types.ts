export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient' | 'admin' | 'doctor';
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  departmentId: string;
  experience: number;
  education: string;
  bio: string;
  image: string;
  hospital?: string;
  googleMapsUrl?: string;
  availability: {
    [key: string]: string[]; // 'Monday': ['09:00', '10:00']
  };
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: 'online' | 'offline';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  orderId?: string;
  amount?: number;
  patientAge: string;
  patientPhone: string;
  notes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  patientId: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  description?: string;
}

export interface Medicine {
  id: string;
  name: string;
  brandName: string;
  genericName: string;
  category: 'prescription' | 'otc';
  composition: string;
  indications: string;
  dosage: string;
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
  manufacturer: string;
  expiry: string;
  storage: string;
  price: number;
  image: string;
  prescriptionRequired: boolean;
  stock: number;
  symptoms: string[];
  alternatives?: { id: string; name: string; price: number }[];
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: { 
    medicineId: string; 
    name: string; 
    quantity: number; 
    price: number 
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliverySlot: string;
  prescriptionUploaded?: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export interface LabPackage {
  id: string;
  name: string;
  description: string;
  parameters: string[]; // Number of tests included
  category: 'general' | 'cardiac' | 'diabetes' | 'women' | 'men' | 'renal';
  image: string;
  sampleRequired: string;
  fastingRequired: boolean;
  preparation?: string;
  isHomeCollectionAvailable: boolean;
}

export interface LabBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  amount: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  collectionType: 'home' | 'lab';
  address?: {
    fullName: string;
    phone: string;
    street: string;
    pincode: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
}
