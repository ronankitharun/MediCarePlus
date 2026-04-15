import React from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS, DOCTORS } from '../constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Heart, Brain, Bone, Baby, Stethoscope, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const iconMap: Record<string, any> = {
  Heart,
  Brain,
  Bone,
  Baby,
  Stethoscope,
};

export const DepartmentsListing = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Medical Departments</h1>
          <p className="text-lg text-slate-600">
            Explore our specialized medical centers. Each department is staffed by world-class 
            specialists and equipped with the latest medical technology to provide you with 
            the best possible care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEPARTMENTS.map((dept, index) => {
            const Icon = iconMap[dept.icon] || Stethoscope;
            const hasDoctors = DOCTORS.some(d => d.departmentId === dept.id);
            
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={dept.image} 
                      alt={dept.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                      <div className="p-2 bg-emerald-600 rounded-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-lg">{dept.name}</span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-slate-900">{dept.name} Center</CardTitle>
                    <CardDescription className="text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    {hasDoctors ? (
                      <Link to={`/doctors?department=${dept.id}`}>
                        <Button variant="outline" className="w-full group/btn border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                          View Specialists
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="w-full border-slate-100 text-slate-400 bg-slate-50 cursor-not-allowed">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        No Specialists Available
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 bg-emerald-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-2xl shadow-emerald-200">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Need Specialized Care?</h2>
            <p className="text-emerald-50 mb-8 text-lg">
              Our patient coordinators are available 24/7 to help you find the right 
              specialist and department for your specific health needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto shadow-lg">
                  Book an Appointment
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Contact Support
              </Button>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-700 rounded-full opacity-20 blur-3xl" />
        </div>
      </div>
    </div>
  );
};
