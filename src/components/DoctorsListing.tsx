import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DOCTORS, DEPARTMENTS } from '../constants';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, Star, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export const DoctorsListing = () => {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'online' | 'offline'>('offline');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredDoctors = selectedDept === 'all' 
    ? DOCTORS 
    : DOCTORS.filter(d => d.departmentId === selectedDept);

  const handleBookClick = async (doctor: any) => {
    if (!user) {
      toast.info('Please login to book an appointment');
      try {
        await signInWithPopup(auth, googleProvider);
        toast.success('Logged in! You can now book your appointment.');
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error('Login failed. Please try again.');
      }
      return;
    }
    setBookingDoctor(doctor);
    // Pre-fill fields if user is logged in
    if (user) {
      setPatientName(user.displayName || '');
      if (user.phoneNumber) {
        setPhoneNumber(user.phoneNumber);
      }
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingDate || !bookingTime || !phoneNumber || !patientAge || !patientName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Strict 10-digit phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsProcessing(true);
      
      let paymentId = 'offline';
      let orderId = 'offline';

      // Real Payment Flow for Online Appointments
      if (appointmentType === 'online') {
        // 1. Create Order on Server
        const orderRes = await fetch('/api/payment/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 200 }),
        });
        
        if (!orderRes.ok) throw new Error('Failed to create payment order');
        const orderData = await orderRes.json();

        // 2. Open Razorpay Checkout
        const options = {
          key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ArogyaLink',
          description: `Consultation with ${bookingDoctor.name}`,
          order_id: orderData.id,
          handler: async (response: any) => {
            // 3. Verify Payment on Server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            if (verifyRes.ok) {
              paymentId = response.razorpay_payment_id;
              orderId = response.razorpay_order_id;
              await finalizeBooking(paymentId, orderId);
            } else {
              toast.error('Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: patientName,
            contact: phoneNumber,
            email: user?.email,
          },
          theme: { color: '#059669' },
          modal: {
            ondismiss: () => setIsProcessing(false),
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return; // Wait for handler to finalize
      }

      await finalizeBooking(paymentId, orderId);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to process booking');
      setIsProcessing(false);
    }
  };

  const finalizeBooking = async (paymentId: string, orderId: string) => {
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user?.uid,
        patientName: patientName,
        patientAge: patientAge,
        patientPhone: phoneNumber,
        doctorId: bookingDoctor.id,
        doctorName: bookingDoctor.name,
        departmentId: bookingDoctor.departmentId,
        date: bookingDate,
        time: bookingTime,
        type: appointmentType,
        paymentStatus: appointmentType === 'online' ? 'paid' : 'pending',
        paymentId,
        orderId,
        amount: appointmentType === 'online' ? 200 : 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      // Send Email Notification to Admin
      try {
        await fetch('/api/appointments/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientName,
            patientPhone: phoneNumber,
            doctorName: bookingDoctor.name,
            date: bookingDate,
            time: bookingTime,
            type: appointmentType,
          }),
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // We don't toast error here because the booking itself was successful
      }

      toast.success('Appointment booked successfully!');
      setBookingDoctor(null);
      setBookingDate('');
      setBookingTime('');
      setPhoneNumber('');
      setPatientAge('');
      setPatientName('');
      setAppointmentType('offline');
    } catch (error) {
      console.error('Finalize error:', error);
      toast.error('Failed to save appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Our Expert <span className="text-emerald-600">Doctors</span></h1>
          <p className="text-slate-600 mt-2">Find and book appointments with the best medical specialists.</p>
        </div>
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor, index) => (
          <motion.div
            key={doctor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden rounded-3xl border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <Badge className="absolute top-4 right-4 bg-white/90 text-emerald-600 hover:bg-white backdrop-blur-sm border-none px-3 py-1">
                  {doctor.experience} Years Exp.
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none">
                    {DEPARTMENTS.find(d => d.id === doctor.departmentId)?.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold">4.9</span>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mt-2">{doctor.name}</CardTitle>
                <CardDescription className="text-emerald-600 font-medium">{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{doctor.bio}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.hospital || 'MediCare Plus Main Hospital'}</span>
                    </div>
                    {doctor.googleMapsUrl && (
                      <a 
                        href={doctor.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Maps
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>Available: Mon - Sat</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleBookClick(doctor)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-emerald-100"
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!bookingDoctor} onOpenChange={() => setBookingDoctor(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule your visit with {bookingDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Select Date</label>
              <input 
                type="date" 
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Select Time Slot</label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Appointment Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAppointmentType('offline')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                    appointmentType === 'offline'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  } font-semibold text-sm`}
                >
                  In-Person (Offline)
                </button>
                <button
                  onClick={() => setAppointmentType('online')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                    appointmentType === 'online'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  } font-semibold text-sm`}
                >
                  Call (Online)
                </button>
              </div>
              {appointmentType === 'online' && (
                <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Consultation Fee</span>
                  <span className="text-lg font-bold text-blue-800">₹200</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Patient Name</label>
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Age</label>
                <input 
                  type="number" 
                  placeholder="Age"
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  min="0"
                  max="120"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                placeholder="10-digit phone number"
                maxLength={10}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-slate-500">Enter exactly 10 digits (e.g., 9876543210)</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleConfirmBooking}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg font-semibold"
            >
              {isProcessing ? 'Processing...' : appointmentType === 'online' ? 'Pay ₹200 & Confirm' : 'Confirm Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
