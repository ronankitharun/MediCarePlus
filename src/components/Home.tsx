import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from '../constants';
import { Heart, Shield, Clock, Users, ArrowRight, Stethoscope, Calendar, Clipboard } from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-50 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Now Open for Digital Consultations
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
                Expert care by <span className="text-emerald-600">Dr. Sai Theja</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Dedicated Orthopedic Surgeon specializing in sports medicine and joint replacement. Get world-class orthopedic care with personalized treatment plans.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-emerald-200">
                  <Link to="/doctors">Book Appointment</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900">Verified</span>
                  <span className="text-sm text-slate-500 font-medium">Surgeon</span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900">100%</span>
                  <span className="text-sm text-slate-500 font-medium">Digital Records</span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-900">Secure</span>
                  <span className="text-sm text-slate-500 font-medium">Consultations</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000" 
                alt="Medical Professional" 
                className="relative z-10 rounded-3xl shadow-2xl shadow-emerald-200"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Easy Booking</h3>
            <p className="text-slate-600 leading-relaxed">Book appointments with your preferred doctors in just a few clicks with our real-time scheduling system.</p>
          </div>
          <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Personalized Care</h3>
            <p className="text-slate-600 leading-relaxed">Get dedicated attention and customized treatment plans tailored specifically to your orthopedic needs.</p>
          </div>
          <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clipboard className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">Digital Reports</h3>
            <p className="text-slate-600 leading-relaxed">Access your medical reports and history securely through your personalized patient dashboard.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
