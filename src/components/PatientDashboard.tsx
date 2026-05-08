import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Appointment, Report, Order, LabBooking } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, User as UserIcon, Activity, ChevronRight, Eye, Phone, MapPin, XCircle, Video, Package, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
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

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Appointment)));
      setLoading(false);
    });

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Report)));
    });

    return () => {
      unsubAppointments();
      unsubReports();
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
    <div className="container mx-auto px-4 py-12 transition-colors duration-300">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Welcome back, <span className="text-emerald-600">{user.displayName}</span></h1>
        <p className="text-muted-foreground mt-2">Manage your health records and upcoming appointments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Stats Section */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
          <Card className="rounded-3xl border-border shadow-sm bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border shadow-sm bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold text-foreground">{reports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border shadow-sm bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                <p className="text-2xl font-bold text-foreground">Good</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-2 space-y-8">
          {/* Appointments Table */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card transition-colors">
            <CardHeader className="border-b bg-muted/30 px-8 py-6">
              <CardTitle className="text-xl font-bold text-foreground">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="px-8 text-muted-foreground">Doctor</TableHead>
                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right px-8 text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground border-border">No appointments found.</TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((apt) => (
                      <TableRow key={apt.id} className="group hover:bg-muted/30 transition-colors border-border">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-foreground">{apt.doctorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{apt.date}</span>
                            <span className="text-xs text-muted-foreground">{apt.time}</span>
                            <Badge variant="outline" className={`mt-1 w-fit text-[10px] uppercase ${
                              apt.type === 'online' ? 'border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-border text-muted-foreground bg-muted/20'
                            }`}>
                              {apt.type}
                            </Badge>
                            {apt.paymentStatus === 'paid' && (
                              <Badge variant="outline" className="mt-1 w-fit text-[10px] uppercase border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20">
                                Paid: ₹{apt.amount}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            apt.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <button 
                            onClick={() => setSelectedAppointment(apt)}
                            className="text-muted-foreground hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full"
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
           <Card className="rounded-3xl border-border shadow-sm h-full bg-card transition-colors">
            <CardHeader className="border-b bg-muted/30 px-8 py-6">
              <CardTitle className="text-xl font-bold text-foreground">Medical Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {reports.length === 0 ? (
                  <div className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No reports uploaded yet.</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4 rounded-2xl border border-border p-4 hover:bg-muted/30 transition-all cursor-pointer group">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-foreground truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(report.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(report.fileUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-emerald-600"
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
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Appointment Details</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                  <p className="text-lg font-bold text-foreground">{selectedAppointment.doctorName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-muted/10">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium">Date</span>
                  </div>
                  <p className="font-bold text-foreground">{selectedAppointment.date}</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-muted/10">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Time</span>
                  </div>
                  <p className="font-bold text-foreground">{selectedAppointment.time}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className="uppercase text-[10px] border-border text-foreground">{selectedAppointment.type}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    selectedAppointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    selectedAppointment.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
                {selectedAppointment.paymentStatus === 'paid' && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Payment</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Paid (₹{selectedAppointment.amount})</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {selectedAppointment.type === 'online' && selectedAppointment.status === 'confirmed' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold shadow-lg shadow-blue-100 dark:shadow-none"
                    onClick={() => {
                      toast.info('Joining consultation call...');
                    }}
                  >
                    <Video className="h-5 w-5 mr-2" /> Join Consultation Call
                  </Button>
                )}
                
                {selectedAppointment.status === 'pending' && (
                  <Button 
                    variant="outline"
                    className="w-full border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl py-6 font-bold"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    disabled={isCancelling}
                  >
                    <XCircle className="h-5 w-5 mr-2" /> Cancel Appointment
                  </Button>
                )}

                <Button 
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground rounded-xl"
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
