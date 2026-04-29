import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError } from '../lib/firebaseUtils';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Appointment, User, Report, LabBooking, Doctor, Medicine, LabPackage } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CheckCircle, XCircle, Trash2, Search, FileText, Plus, User as UserIcon, ExternalLink, Eye, FlaskConical, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labPackages, setLabPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'lab' | 'management'>('appointments');
  const [mgmtTab, setMgmtTab] = useState<'doctors' | 'medicines' | 'labs'>('doctors');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Entity Form States
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<'doctor' | 'medicine' | 'lab'>('doctor');
  
  // Report Modal State
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [viewingReportsPatient, setViewingReportsPatient] = useState<User | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  useEffect(() => {
    if (!isAdmin) return;

    const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const labBookingsQuery = query(collection(db, 'lab_bookings'), orderBy('createdAt', 'desc'));
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const reportsQuery = query(collection(db, 'reports'), orderBy('uploadedAt', 'desc'));

    const unsubAppointments = onSnapshot(appointmentsQuery, 
      (snapshot) => {
        setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
      },
      (error) => handleFirestoreError(error, 'list', 'appointments')
    );

    const unsubLabBookings = onSnapshot(labBookingsQuery, 
      (snapshot) => {
        setLabBookings(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LabBooking)));
      },
      (error) => handleFirestoreError(error, 'list', 'lab_bookings')
    );

    const unsubUsers = onSnapshot(usersQuery, 
      (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as User)));
        setLoading(false);
      },
      (error) => handleFirestoreError(error, 'list', 'users')
    );

    const unsubReports = onSnapshot(reportsQuery, 
      (snapshot) => {
        setReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Report)));
      },
      (error) => handleFirestoreError(error, 'list', 'reports')
    );

    const unsubDoctors = onSnapshot(collection(db, 'doctors'), 
      (snapshot) => {
        setDoctors(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Doctor)));
      },
      (error) => handleFirestoreError(error, 'list', 'doctors')
    );

    const unsubMedicines = onSnapshot(collection(db, 'medicines'), 
      (snapshot) => {
        setMedicines(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Medicine)));
      },
      (error) => handleFirestoreError(error, 'list', 'medicines')
    );

    const unsubLabPackages = onSnapshot(collection(db, 'lab_packages'), 
      (snapshot) => {
        setLabPackages(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LabPackage)));
      },
      (error) => handleFirestoreError(error, 'list', 'lab_packages')
    );

    return () => {
      unsubAppointments();
      unsubLabBookings();
      unsubUsers();
      unsubReports();
      unsubDoctors();
      unsubMedicines();
      unsubLabPackages();
    };
  }, [isAdmin]);

  const filteredAppointments = appointments.filter(apt => 
    apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = users.filter(u => 
    u.role === 'patient' && 
    (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Update error:', error);
      handleFirestoreError(error, 'update', `appointments/${appointmentId}`);
      toast.error('Failed to update status');
    }
  };

  const handleLabStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'lab_bookings', bookingId), { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error('Update error:', error);
      handleFirestoreError(error, 'update', `lab_bookings/${bookingId}`);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      toast.success('Appointment deleted');
    } catch (error) {
      console.error('Delete error:', error);
      handleFirestoreError(error, 'delete', `appointments/${appointmentId}`);
      toast.error('Failed to delete appointment');
    }
  };

  const handleDeleteEntity = async (id: string, type: 'doctor' | 'medicine' | 'lab') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    const collectionName = type === 'doctor' ? 'doctors' : type === 'medicine' ? 'medicines' : 'lab_packages';
    try {
      await deleteDoc(doc(db, collectionName, id));
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Delete ${type} error:`, error);
      handleFirestoreError(error, 'delete', `${collectionName}/${id}`);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSaveEntity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => {
      if (['price', 'experience', 'stock'].includes(key)) {
        data[key] = Number(value);
      } else if (['parameters', 'sideEffects', 'precautions', 'interactions', 'symptoms'].includes(key)) {
        data[key] = value.toString().split(',').map(s => s.trim()).filter(Boolean);
      } else if (['prescriptionRequired', 'fastingRequired', 'isHomeCollectionAvailable'].includes(key)) {
        data[key] = value === 'on';
      } else {
        data[key] = value;
      }
    });

    const collectionName = entityType === 'doctor' ? 'doctors' : entityType === 'medicine' ? 'medicines' : 'lab_packages';
    try {
      if (editingEntity) {
        await setDoc(doc(db, collectionName, editingEntity.id), data, { merge: true });
        toast.success(`${entityType} updated`);
      } else {
        await addDoc(collection(db, collectionName), data);
        toast.success(`${entityType} added`);
      }
      setIsEntityModalOpen(false);
      setEditingEntity(null);
    } catch (error) {
      console.error(`Error saving ${entityType}:`, error);
      handleFirestoreError(error, editingEntity ? 'update' : 'create', collectionName);
      toast.error(`Error saving ${entityType}`);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      toast.success('Report deleted');
    } catch (error) {
      console.error('Delete report error:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleAddReport = async () => {
    if (!selectedPatient || !reportTitle) {
      toast.error('Please fill in the report title');
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (uploadMode === 'url' && !reportUrl) {
      toast.error('Please enter a valid report URL');
      return;
    }

    try {
      setIsAddingReport(true);

      if (uploadMode === 'file' && selectedFile) {
        setUploadProgress(0);
        const storageRef = ref(storage, `reports/${selectedPatient.uid}/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}. Try using the URL method instead.`);
            setIsAddingReport(false);
          }, 
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await saveReportToFirestore(downloadUrl, selectedFile.name, selectedFile.type);
          }
        );
      } else {
        // Manual URL Mode
        await saveReportToFirestore(reportUrl, 'External Document', 'application/pdf');
      }
    } catch (error) {
      console.error('General error:', error);
      toast.error('An unexpected error occurred');
      setIsAddingReport(false);
    }
  };

  const saveReportToFirestore = async (url: string, fileName: string, fileType: string) => {
    try {
      await addDoc(collection(db, 'reports'), {
        patientId: selectedPatient?.uid,
        title: reportTitle,
        fileUrl: url,
        fileName: fileName,
        fileType: fileType,
        uploadedAt: new Date().toISOString(),
      });

      toast.success('Report record saved successfully');
      setReportTitle('');
      setReportUrl('');
      setSelectedFile(null);
      setUploadProgress(0);
      setIsAddingReport(false);
    } catch (dbError) {
      console.error('Firestore save error:', dbError);
      toast.error('Failed to save record to database');
      setIsAddingReport(false);
    }
  };

  if (!isAdmin) return <div className="p-20 text-center text-red-500 font-bold">Access Denied. Admin privileges required.</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Admin <span className="text-emerald-600">Dashboard</span></h1>
        <p className="text-slate-600 mt-2">Manage appointments, patients, and hospital operations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Stats */}
        <div className="lg:col-span-4 grid gap-6 md:grid-cols-5">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'patient').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Lab Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{labBookings.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Appointments</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Confirmed</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'confirmed').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Cancelled</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'cancelled').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="lg:col-span-4 flex gap-4 mb-2">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'appointments' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            Appointments
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'patients' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            Patients & Reports
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'lab' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            Lab Bookings
          </button>
          <button 
            onClick={() => setActiveTab('management')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'management' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            Management
          </button>
        </div>

        {/* Appointments Management */}
        {activeTab === 'appointments' ? (
          <div className="lg:col-span-4">
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Manage Appointments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search appointments..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-8">Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{apt.patientName}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>Age: {apt.patientAge}</span>
                              <span>•</span>
                              <span>{apt.patientPhone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">{apt.doctorName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{apt.date}</span>
                            <span className="text-xs text-slate-500">{apt.time}</span>
                            <Badge variant="outline" className={`mt-1 w-fit text-[10px] uppercase ${
                              apt.type === 'online' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-slate-200 text-slate-600 bg-slate-50'
                            }`}>
                              {apt.type}
                            </Badge>
                            {apt.paymentStatus === 'paid' && (
                              <Badge variant="outline" className="mt-1 w-fit text-[10px] uppercase border-emerald-200 text-emerald-600 bg-emerald-50">
                                Paid: ₹{apt.amount}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={apt.status} onValueChange={(val) => handleStatusUpdate(apt.id, val)}>
                            <SelectTrigger className="w-[140px] h-9 rounded-full border-slate-200 text-xs font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <button 
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'lab' ? (
          <div className="lg:col-span-4">
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Manage Lab Bookings</CardTitle>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search lab bookings..." 
                     className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-8">Patient / Package</TableHead>
                      <TableHead>Collection</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right px-8">Collection Info</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labBookings.filter(b => b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || b.packageName.toLowerCase().includes(searchTerm.toLowerCase())).map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{booking.userName}</span>
                            <span className="text-xs text-slate-500">{booking.packageName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {booking.collectionType === 'home' ? <MapPin className="h-3 w-3 text-orange-500" /> : <FlaskConical className="h-3 w-3 text-emerald-500" />}
                             <span className="text-xs font-medium capitalize">{booking.collectionType}</span>
                          </div>
                          {booking.collectionType === 'home' && booking.address && (
                            <p className="text-[10px] text-slate-400 leading-tight mt-1 max-w-[150px]">
                              {booking.address.street}, {booking.address.pincode}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{booking.date}</span>
                            <span className="text-xs text-slate-500">{booking.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={booking.status} onValueChange={(val) => handleLabStatusUpdate(booking.id, val)}>
                            <SelectTrigger className="w-[140px] h-9 rounded-full border-slate-200 text-xs font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <span className="text-xs font-semibold text-slate-500">Pay at Lab/Home</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'patients' ? (
          <div className="lg:col-span-4">
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Patient Records & Reports</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search patients..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-8">Patient Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((p) => (
                      <TableRow key={p.uid} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-slate-900">{p.displayName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">{p.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setViewingReportsPatient(p)}
                            >
                              <FileText className="h-4 w-4 mr-2" /> View Reports
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setSelectedPatient(p)}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Report
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                <button 
                  onClick={() => setMgmtTab('doctors')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mgmtTab === 'doctors' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Doctors
                </button>
                <button 
                  onClick={() => setMgmtTab('medicines')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mgmtTab === 'medicines' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pharmacy
                </button>
                <button 
                  onClick={() => setMgmtTab('labs')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mgmtTab === 'labs' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Lab Packages
                </button>
              </div>
              <Button 
                onClick={() => {
                  setEntityType(mgmtTab === 'doctors' ? 'doctor' : mgmtTab === 'medicines' ? 'medicine' : 'lab');
                  setEditingEntity(null);
                  setIsEntityModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" /> 
                Add {mgmtTab === 'doctors' ? 'Doctor' : mgmtTab === 'medicines' ? 'Medicine' : 'Lab Package'}
              </Button>
            </div>

            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-8">Name / Details</TableHead>
                      <TableHead>{mgmtTab === 'doctors' ? 'Specialty' : mgmtTab === 'medicines' ? 'Price' : 'Description'}</TableHead>
                      <TableHead>{mgmtTab === 'doctors' ? 'Experience' : mgmtTab === 'medicines' ? 'Stock' : 'Category'}</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mgmtTab === 'doctors' && doctors.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img src={doc.image} alt={doc.name} className="h-10 w-10 rounded-full object-cover" />
                            <div>
                              <p className="font-bold text-slate-900">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.hospital}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{doc.specialty}</TableCell>
                        <TableCell className="text-sm">{doc.experience} Years</TableCell>
                        <TableCell className="text-right px-8 space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingEntity(doc); setEntityType('doctor'); setIsEntityModalOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteEntity(doc.id, 'doctor')}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {mgmtTab === 'medicines' && medicines.map((med) => (
                      <TableRow key={med.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img src={med.image} alt={med.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-slate-900">{med.name}</p>
                              <p className="text-xs text-slate-500">{med.brandName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">₹{med.price}</TableCell>
                        <TableCell className="text-sm font-medium">{med.stock} units</TableCell>
                        <TableCell className="text-right px-8 space-x-2">
                           <Button variant="ghost" size="sm" onClick={() => { setEditingEntity(med); setEntityType('medicine'); setIsEntityModalOpen(true); }}><Eye className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteEntity(med.id, 'medicine')}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {mgmtTab === 'labs' && labPackages.map((pkg) => (
                      <TableRow key={pkg.id} className="hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img src={pkg.image} alt={pkg.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div>
                               <p className="font-bold text-slate-900">{pkg.name}</p>
                               <p className="text-xs text-slate-500">{pkg.parameters.length} Parameters</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm italic text-slate-500 max-w-[200px] truncate">{pkg.description}</TableCell>
                        <TableCell className="text-sm uppercase font-bold text-slate-400 text-[10px]">{pkg.category}</TableCell>
                        <TableCell className="text-right px-8 space-x-2">
                           <Button variant="ghost" size="sm" onClick={() => { setEditingEntity(pkg); setEntityType('lab'); setIsEntityModalOpen(true); }}><Eye className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteEntity(pkg.id, 'lab')}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Report Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Medical Report</DialogTitle>
            <p className="text-slate-500 text-sm">Uploading for: <span className="font-bold text-emerald-600">{selectedPatient?.displayName}</span></p>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Report Title</label>
              <input 
                type="text" 
                placeholder="e.g. Blood Test Result"
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === 'file' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                File Upload
              </button>
              <button 
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${uploadMode === 'url' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Manual URL
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Select Report File (PDF/Image)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf,image/*"
                    className="hidden"
                    id="report-file-upload"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="report-file-upload"
                    className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      selectedFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50'
                    }`}
                  >
                    <Plus className={`h-6 w-6 mb-2 ${selectedFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-medium text-slate-600">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </span>
                  </label>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Report URL (PDF/Image)</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/report.pdf"
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={reportUrl}
                  onChange={(e) => setReportUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">Paste a link from Google Drive, Dropbox, or any file host.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddReport} 
              disabled={isAddingReport}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg font-semibold"
            >
              {isAddingReport ? 'Processing...' : 'Save Report Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reports Dialog */}
      <Dialog open={!!viewingReportsPatient} onOpenChange={() => setViewingReportsPatient(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Patient Medical Reports</DialogTitle>
            <p className="text-slate-500 text-sm">Viewing records for: <span className="font-bold text-emerald-600">{viewingReportsPatient?.displayName}</span></p>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {reports.filter(r => r.patientId === viewingReportsPatient?.uid).length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No reports found for this patient.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.filter(r => r.patientId === viewingReportsPatient?.uid).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{report.title}</p>
                        <p className="text-xs text-slate-500">{new Date(report.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-9 w-9 p-0 text-slate-400 hover:text-emerald-600"
                        onClick={() => window.open(report.fileUrl, '_blank', 'noopener,noreferrer')}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <button 
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setViewingReportsPatient(null)}
              className="w-full rounded-xl py-6 text-lg font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Entity Modal */}
      <Dialog open={isEntityModalOpen} onOpenChange={() => setIsEntityModalOpen(false)}>
        <DialogContent className="sm:max-w-[700px] rounded-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingEntity ? 'Edit' : 'Add'} {entityType === 'doctor' ? 'Doctor' : entityType === 'medicine' ? 'Medicine' : 'Lab Package'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEntity} className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Display Name</label>
              <input name="name" defaultValue={editingEntity?.name} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {entityType === 'doctor' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Specialty</label>
                  <input name="specialty" defaultValue={editingEntity?.specialty} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Experience (Years)</label>
                  <input name="experience" type="number" defaultValue={editingEntity?.experience} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Education</label>
                  <input name="education" defaultValue={editingEntity?.education} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Hospital</label>
                  <input name="hospital" defaultValue={editingEntity?.hospital} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Bio</label>
                  <textarea name="bio" defaultValue={editingEntity?.bio} className="h-20 rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            {entityType === 'medicine' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Brand Name</label>
                  <input name="brandName" defaultValue={editingEntity?.brandName} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Generic Name</label>
                  <input name="genericName" defaultValue={editingEntity?.genericName} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Price (₹)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingEntity?.price} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Stock</label>
                  <input name="stock" type="number" defaultValue={editingEntity?.stock} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Manufacturer</label>
                  <input name="manufacturer" defaultValue={editingEntity?.manufacturer} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Category (otc / prescription)</label>
                  <input name="category" defaultValue={editingEntity?.category || 'otc'} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            {entityType === 'lab' && (
              <>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea name="description" defaultValue={editingEntity?.description} required className="h-20 rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Parameters (Comma separated)</label>
                  <input name="parameters" defaultValue={editingEntity?.parameters?.join(', ')} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <input name="category" defaultValue={editingEntity?.category} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Sample Required</label>
                  <input name="sampleRequired" defaultValue={editingEntity?.sampleRequired} className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </>
            )}

            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Image URL</label>
              <input name="image" defaultValue={editingEntity?.image} required className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {entityType === 'lab' && (
              <div className="col-span-2 flex gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="fastingRequired" defaultChecked={editingEntity?.fastingRequired} /> Fasting Required
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="isHomeCollectionAvailable" defaultChecked={editingEntity?.isHomeCollectionAvailable} /> Home Collection Available
                </label>
              </div>
            )}

            {entityType === 'medicine' && (
              <label className="flex items-center gap-2 text-sm text-slate-700 col-span-2 mt-2">
                <input type="checkbox" name="prescriptionRequired" defaultChecked={editingEntity?.prescriptionRequired} /> Prescription Required
              </label>
            )}

            <div className="col-span-2 mt-6 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setIsEntityModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12">Save {entityType}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
