import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Appointment, Report } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Calendar, Clock, FileText, User as UserIcon, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report)));
    });

    return () => {
      unsubAppointments();
      unsubReports();
    };
  }, [user]);

  if (!user) return <div className="p-20 text-center">Please login to view your dashboard.</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back, <span className="text-emerald-600">{user.displayName}</span></h1>
        <p className="text-slate-600 mt-2">Manage your health records and upcoming appointments.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Stats Section */}
        <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Medical Reports</p>
                <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
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
                          <button className="text-slate-400 hover:text-emerald-600 transition-colors">
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

        {/* Reports Section */}
        <div className="lg:col-span-1">
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
