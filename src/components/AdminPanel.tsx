import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Appointment, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Calendar, CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as User)));
      setLoading(false);
    });

    return () => {
      unsubAppointments();
      unsubUsers();
    };
  }, [isAdmin]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error('Update error:', error);
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
      toast.error('Failed to delete appointment');
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
        <div className="lg:col-span-4 grid gap-6 md:grid-cols-4">
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

        {/* Appointments Management */}
        <div className="lg:col-span-4">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Manage Appointments</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  {appointments.map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-slate-50/50">
                      <TableCell className="px-8 py-4">
                        <span className="font-semibold text-slate-900">{apt.patientName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{apt.doctorName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{apt.date}</span>
                          <span className="text-xs text-slate-500">{apt.time}</span>
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
      </div>
    </div>
  );
};
