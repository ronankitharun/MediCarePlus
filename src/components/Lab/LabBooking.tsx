import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LAB_PACKAGES } from '../../constants';
import { LabPackage } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Truck, Landmark, ShieldCheck, ChevronLeft, User as UserIcon, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const LabBooking = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pkg, setPkg] = useState<LabPackage | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('lab');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    name: user?.displayName || '',
    age: '',
    phone: ''
  });
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    phone: '',
    street: '',
    city: 'Srikakulam',
    state: 'Andhra Pradesh',
    pincode: ''
  });

  useEffect(() => {
    const fetchPackage = async () => {
      const found = LAB_PACKAGES.find(p => p.id === packageId);
      if (found) {
        setPkg(found);
      } else {
        // Check Firestore
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const docRef = doc(db, 'lab_packages', packageId!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setPkg({ id: docSnap.id, ...docSnap.data() } as LabPackage);
          } else {
            toast.error('Package not found');
            navigate('/lab');
          }
        } catch (err) {
          console.error('Error fetching package:', err);
          toast.error('Error loading package');
          navigate('/lab');
        }
      }
    };
    fetchPackage();
  }, [packageId, navigate]);

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 7; i <= 18; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to book a test');
      return;
    }
    if (!bookingDate || !bookingTime) {
      toast.error('Please select preferred date and time');
      return;
    }
    if (!patientDetails.name || !patientDetails.age || !patientDetails.phone) {
      toast.error('Please provide all patient details');
      return;
    }
    if (collectionType === 'home') {
      if (!address.street || !address.pincode) {
        toast.error('Please complete your collection address');
        return;
      }
    }

    try {
      setIsProcessing(true);
      
      const bookingData = {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        patientName: patientDetails.name,
        patientAge: patientDetails.age,
        patientPhone: patientDetails.phone,
        packageId: pkg!.id,
        packageName: pkg!.name,
        date: bookingDate,
        time: bookingTime,
        status: 'pending',
        collectionType,
        address: collectionType === 'home' ? address : null,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'lab_bookings'), bookingData);
      
      toast.success('Lab Test Booked Successfully!');
      navigate('/dashboard');

    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Could not complete your booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pkg) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/lab')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 font-semibold transition-colors"
      >
        <ChevronLeft className="h-5 w-5" /> Back to Packages
      </button>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-4xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserIcon className="h-6 w-6" />
                </div>
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Patient Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                    value={patientDetails.name}
                    onChange={(e) => setPatientDetails({...patientDetails, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Age</label>
                  <input 
                    type="number" 
                    placeholder="Age"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({...patientDetails, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Contact Number"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                    value={patientDetails.phone}
                    onChange={(e) => setPatientDetails({...patientDetails, phone: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-4xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                Schedule Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Preferred Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Preferred Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                    <select
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    >
                      <option value="">Select a slot</option>
                      {getTimeSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <label className="text-sm font-bold text-slate-700 block mb-4 ml-1">Collection Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setCollectionType('lab')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                      collectionType === 'lab' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'
                    }`}
                  >
                    <Landmark className="h-8 w-8" />
                    <span className="font-bold">Walk-in at Lab</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Verified Hospital Lab</span>
                  </button>
                  <button 
                    disabled={!pkg.isHomeCollectionAvailable}
                    onClick={() => setCollectionType('home')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
                      !pkg.isHomeCollectionAvailable ? 'opacity-40 cursor-not-allowed grayscale' :
                      collectionType === 'home' 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                        : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'
                    }`}
                  >
                    <Truck className="h-8 w-8" />
                    <span className="font-bold">Home Sample Collection</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                      {pkg.isHomeCollectionAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </button>
                </div>
              </div>

              {collectionType === 'home' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-12 pt-8 border-t border-slate-100 space-y-6"
                >
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" /> Collection Address
                  </h4>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="md:col-span-1">
                       <input 
                        type="text" 
                        placeholder="House No / Street / Landmark"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Pincode"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                      value={address.pincode}
                      onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-8">
          <Card className="rounded-4xl border-slate-100 shadow-sm overflow-hidden sticky top-24">
            <CardHeader className="bg-emerald-600 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FlaskConical className="h-24 w-24" />
              </div>
              <CardTitle className="text-xl font-bold">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-8">
                <img 
                  src={pkg.image} 
                  className="h-20 w-20 rounded-2xl object-cover shadow-sm bg-slate-50"
                  alt={pkg.name}
                />
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{pkg.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] uppercase font-bold tracking-wider">{pkg.category}</Badge>
                </div>
              </div>

              <div className="space-y-4 border-b border-slate-100 pb-8 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Package Content</span>
                  <span className="font-bold text-slate-800">{pkg.parameters.length} Parameters</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Fasting Needed</span>
                  <span className={`font-bold ${pkg.fastingRequired ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {pkg.fastingRequired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Collection</span>
                  <span className="font-bold text-slate-800 capitalize">{collectionType}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">No Advance Payment</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Free Booking Confirmation</p>
                    </div>
                 </div>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-8 text-xl font-black shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isProcessing ? 'Booking...' : `Confirm Booking`}
              </Button>

              <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Digital Reports in 48 hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
