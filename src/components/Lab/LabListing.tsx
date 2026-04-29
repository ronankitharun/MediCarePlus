import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LAB_PACKAGES } from '../../constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Activity, FlaskConical, ShieldCheck, Clock, MapPin, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError } from '../../lib/firebaseUtils';
import { db } from '../../firebase';
import { LabPackage } from '../../types';

export const LabListing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [allPackages, setAllPackages] = useState<LabPackage[]>(LAB_PACKAGES);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lab_packages'), 
      (snapshot) => {
        const firestorePackages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LabPackage));
        const combined = [...firestorePackages];
        LAB_PACKAGES.forEach(lp => {
          if (!combined.find(clp => clp.id === lp.id)) {
            combined.push(lp);
          }
        });
        setAllPackages(combined);
      },
      (error) => handleFirestoreError(error, 'list', 'lab_packages')
    );
    return () => unsub();
  }, []);

  const categories = [
    { id: 'all', label: 'All Packages', icon: <FlaskConical className="h-4 w-4" /> },
    { id: 'general', label: 'General', icon: <Activity className="h-4 w-4" /> },
    { id: 'diabetes', label: 'Diabetes', icon: <Info className="h-4 w-4" /> },
    { id: 'cardiac', label: 'Cardiac', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'women', label: 'Women Health', icon: <Info className="h-4 w-4" /> },
    { id: 'renal', label: 'Renal/Kidney', icon: <Info className="h-4 w-4" /> },
  ];

  const filteredPackages = allPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || pkg.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Header */}
      <div className="bg-[#E0F2F1] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/50 rounded-full -ml-24 -mb-24 blur-2xl" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-slate-800 mb-4 font-serif"
          >
            Lab & Diagnostic
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-emerald-700 text-xl font-medium"
          >
            All Packages
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search health packages or tests..." 
              className="w-full pl-12 pr-4 py-4 rounded-3xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat.id 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-600 hover:text-emerald-600'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full rounded-4xl border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-emerald-700 hover:bg-white backdrop-blur-sm border-none font-bold text-[10px] uppercase tracking-wider">
                        {pkg.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight font-serif min-h-[4rem]">
                      {pkg.name}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {pkg.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Free Confirmation</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-400">
                          {pkg.fastingRequired && (
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                                <Clock className="h-4 w-4" />
                              </div>
                              <span className="text-[10px] uppercase font-bold">Fasting</span>
                            </div>
                          )}
                          {pkg.isHomeCollectionAvailable && (
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <span className="text-[10px] uppercase font-bold text-center">Home Coll.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-2xl border-emerald-600 text-emerald-600 hover:bg-emerald-50 h-14 font-bold tracking-wide"
                        >
                          Read more
                        </Button>
                        <Button 
                          className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white h-14 font-bold tracking-wide shadow-lg shadow-emerald-100"
                          onClick={() => navigate(`/lab/book/${pkg.id}`)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Not Found */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-4xl border border-dashed border-slate-200">
            <FlaskConical className="h-20 w-20 text-slate-100 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No packages match your search</h3>
            <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

      {/* Trust Section */}
      <div className="bg-slate-900 py-16 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold">Accredited Labs</h4>
              <p className="text-slate-400 text-sm">We partner with NABL certified quality laboratories only.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <Clock className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold">Fast Results</h4>
              <p className="text-slate-400 text-sm">Digital reports typically delivered within 24-48 hours.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <MapPin className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold">Free Collection</h4>
              <p className="text-slate-400 text-sm">Complimentary home sample collection on selected packages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
