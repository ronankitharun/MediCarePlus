import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Appointment, Report, Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, FileText, User as UserIcon, Activity, ChevronRight, Eye, Phone, MapPin, XCircle, Video, Package } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const reportsQuery = query(
      collection(db, 'reports'),
      where('patientId', '==', user.uid),
      orderBy('uploadedAt', 'desc')
    );

    const ordersQuery = query(
      collection(db, 'pharmacy_orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
    });

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });

    return () => {
      unsubAppointments();
      unsubReports();
      unsubOrders();
    };
  }, [user]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      setIsCancelling(true);
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled'
      });
      toast.success('Appointment cancelled successfully');
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!user) return <div className="p-20 text-center">Please login to view your dashboard.</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back, <span className="text-emerald-600">{user.displayName}</span></h1>
        <p className="text-slate-600 mt-2">Manage your health records and upcoming appointments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Stats Section */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-4">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Appointments</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Reports</p>
                <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Medicine Orders</p>
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Health Status</p>
                <p className="text-2xl font-bold text-slate-900">Good</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
              <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-8">Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right px-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-slate-500">No appointments found.</TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((apt) => (
                      <TableRow key={apt.id} className="group hover:bg-slate-50/50">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-slate-900">{apt.doctorName}</span>
                          </div>
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
                          <Badge className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <button 
                            onClick={() => setSelectedAppointment(apt)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-full"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-1 space-y-8">
           {/* Reports Section */}
           <Card className="rounded-3xl border-slate-100 shadow-sm h-full">
            <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
              <CardTitle className="text-xl font-bold">Medical Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {reports.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">No reports uploaded yet.</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-slate-900 truncate">{report.title}</p>
                        <p className="text-xs text-slate-500">{new Date(report.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(report.fileUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-emerald-600"
                        title="View Report"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

           {/* Pharmacy Orders Section */}
           <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
             <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
               <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
             </CardHeader>
             <CardContent className="p-6">
               <div className="flex flex-col gap-4">
                 {orders.length === 0 ? (
                   <div className="py-8 text-center">
                     <Package className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                     <p className="text-slate-500 text-sm">No orders yet.</p>
                   </div>
                 ) : (
                   orders.map((order) => (
                     <div key={order.id} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="font-bold text-slate-900 text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                           </div>
                           <Badge variant="outline" className="text-[10px] capitalize bg-white">{order.status}</Badge>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <p className="text-xs text-slate-600">{order.items.length} Medicines</p>
                           <p className="font-bold text-emerald-600">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                     </div>
                   ))
                 )}
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Appointment Details</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Doctor</p>
                  <p className="text-lg font-bold text-slate-900">{selectedAppointment.doctorName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium">Date</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedAppointment.date}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Time</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedAppointment.time}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Type</span>
                  <Badge variant="outline" className="uppercase text-[10px]">{selectedAppointment.type}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    selectedAppointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    selectedAppointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
                {selectedAppointment.paymentStatus === 'paid' && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm text-slate-500">Payment</span>
                    <span className="text-sm font-bold text-emerald-600">Paid (₹{selectedAppointment.amount})</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {selectedAppointment.type === 'online' && selectedAppointment.status === 'confirmed' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold"
                    onClick={() => {
                      toast.info('Joining consultation call...');
                      // In a real app, this would redirect to a video/audio call room
                    }}
                  >
                    <Video className="h-5 w-5 mr-2" /> Join Consultation Call
                  </Button>
                )}
                
                {selectedAppointment.status === 'pending' && (
                  <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-6 font-bold"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    disabled={isCancelling}
                  >
                    <XCircle className="h-5 w-5 mr-2" /> Cancel Appointment
                  </Button>
                )}

                <Button 
                  variant="ghost"
                  className="w-full text-slate-500 rounded-xl"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
