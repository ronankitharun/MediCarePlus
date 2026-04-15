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
