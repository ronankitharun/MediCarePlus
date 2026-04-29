import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MEDICINES } from '../../constants';
import { Medicine } from '../../types';
import { Search, Filter, ShoppingCart, Plus, Minus, ArrowRight, Share2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMedicine } from '../../MedicineContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { handleFirestoreError } from '../../lib/firebaseUtils';
import { db } from '../../firebase';

export const MedicineListing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'prescription' | 'otc'>('all');
  const { cart, addToCart } = useMedicine();
  const navigate = useNavigate();
  const [allMedicines, setAllMedicines] = useState<Medicine[]>(MEDICINES);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'medicines'), 
      (snapshot) => {
        const firestoreMedicines = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Medicine));
        const combined = [...firestoreMedicines];
        MEDICINES.forEach(m => {
          if (!combined.find(cm => cm.id === m.id)) {
            combined.push(m);
          }
        });
        setAllMedicines(combined);
      },
      (error) => handleFirestoreError(error, 'list', 'medicines')
    );
    return () => unsub();
  }, []);

  const filteredMedicines = allMedicines.filter(med => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-8 md:items-center">
        <div className="text-center md:max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-slate-900 tracking-tight"
          >
            ArogyaLink <span className="text-emerald-600">Pharmacy</span>
          </motion.h1>
          <p className="text-slate-600 mt-4 text-lg">
            Certified medicines delivered safely to your doorstep. Search by medicine name, salt, or symptom.
          </p>
        </div>

        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              type="text"
              placeholder="Search Dolo, Paracetamol, Fever..."
              className="pl-11 h-14 rounded-2xl border-slate-200 shadow-sm focus-visible:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && searchQuery.length >= 2 && filteredMedicines.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                {filteredMedicines.slice(0, 5).map(med => (
                  <div 
                    key={med.id}
                    className="p-4 hover:bg-emerald-50 cursor-pointer flex items-center justify-between group border-b border-slate-50 last:border-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery(med.name);
                      navigate(`/pharmacy/${med.id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <img src={med.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-xs">{med.name}</p>
                        <p className="text-[10px] text-slate-500">{med.genericName}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {(['all', 'prescription', 'otc'] as const).map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl h-14 px-6 capitalize font-medium ${
                  selectedCategory === cat ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMedicines.map((medicine, index) => (
          <motion.div
            key={medicine.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group overflow-hidden rounded-3xl border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div 
                className="relative h-48 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/pharmacy/${medicine.id}`)}
              >
                <img 
                  src={medicine.image} 
                  alt={medicine.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {medicine.prescriptionRequired && (
                  <Badge className="absolute top-3 left-3 bg-red-100 text-red-700 hover:bg-red-200 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Prescription Required
                  </Badge>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                   <Button variant="secondary" className="rounded-full bg-white/90 backdrop-blur-sm">
                      View Details
                   </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <div>
                      <CardTitle className="text-xl font-bold text-slate-900 leading-tight">
                        {medicine.name}
                      </CardTitle>
                      <CardDescription className="text-emerald-600 font-medium truncate mt-1">
                        {medicine.genericName}
                      </CardDescription>
                   </div>
                   <div className="text-lg font-bold text-slate-900">
                     ₹{medicine.price.toFixed(2)}
                   </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1">
                  {medicine.symptoms?.slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="bg-slate-50 text-slate-500 hover:bg-slate-100 border-none text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(medicine);
                    toast.success(`${medicine.name} added to cart`);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-emerald-100 mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="py-20 text-center">
          <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No medicines found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or category filters.</p>
        </div>
      )}

      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button 
            onClick={() => navigate('/pharmacy/cart')}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 w-16 shadow-2xl shadow-emerald-200 border-4 border-white relative"
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-[10px] p-0 border-2 border-white">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </Badge>
          </Button>
        </motion.div>
      )}
    </div>
  );
};
