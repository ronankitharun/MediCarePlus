import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MEDICINES } from '../../constants';
import { Medicine } from '../../types';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Package,
  History,
  FileText,
  Share2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMedicine } from '../../MedicineContext';
import { toast } from 'sonner';

export const MedicineDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, updateQuantity } = useMedicine();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicine = async () => {
      const found = MEDICINES.find(m => m.id === id);
      if (found) {
        setMedicine(found);
        setLoading(false);
      } else {
        try {
          const docRef = doc(db, 'medicines', id!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setMedicine({ id: docSnap.id, ...docSnap.data() } as Medicine);
          }
        } catch (err) {
          console.error('Error fetching medicine:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMedicine();
  }, [id]);

  const cartItem = cart.find(item => item.medicine.id === id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Loading medicine details...</p>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Medicine not found</h2>
        <Button onClick={() => navigate('/pharmacy')} className="mt-4 border-emerald-600 text-emerald-600 hover:bg-emerald-50">Back to Pharmacy</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/pharmacy')}
        className="mb-8 hover:bg-emerald-50 text-emerald-700 font-medium"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Medicines
      </Button>

      <div className="grid gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="sticky top-24">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200 border border-slate-100">
              <img 
                src={medicine.image} 
                alt={medicine.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              {medicine.prescriptionRequired && (
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <FileText className="h-4 w-4" />
                  Prescription Required
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: ShieldCheck, label: '100% Genuine', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Truck, label: 'Fast Delivery', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: RotateCcw, label: 'Easy Returns', color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} rounded-2xl p-4 text-center border border-slate-100`}>
                  <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Medical Disclaimer</h4>
                <p className="text-sm text-amber-800 leading-relaxed mt-1">
                  <b>Consult a doctor before use. Do not self-medicate.</b> The information provided is for educational purposes and should not be treated as a prescription.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700 bg-emerald-50/50">
                {medicine.category.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
                {medicine.manufacturer}
              </Badge>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight">{medicine.name}</h1>
            <p className="text-xl text-emerald-600 font-medium mt-2">{medicine.genericName}</p>
            
            <div className="flex items-baseline gap-4 mt-6">
              <span className="text-4xl font-black text-slate-900">₹{medicine.price.toFixed(2)}</span>
              <span className="text-slate-400 line-through">₹{(medicine.price * 1.2).toFixed(2)}</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-bold">20% OFF</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {cartItem ? (
              <div className="flex items-center gap-6 bg-slate-100 rounded-2xl p-2 h-16 w-full max-w-[200px]">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-white"
                  onClick={() => updateQuantity(medicine.id, cartItem.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold flex-1 text-center">{cartItem.quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-white"
                  onClick={() => updateQuantity(medicine.id, cartItem.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  addToCart(medicine);
                  toast.success('Added to cart');
                }}
                className="h-16 flex-1 max-w-sm rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-100"
              >
                <ShoppingCart className="h-5 w-5 mr-3" />
                Add to Cart
              </Button>
            )}
            <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-slate-200 text-slate-400 hover:text-emerald-600">
              <Share2 className="h-6 w-6" />
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-8">
            <Section icon={Info} title="Usage / Indications">
              <p className="text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-4 bg-emerald-50/30 py-2 rounded-r-lg">
                {medicine.indications}
              </p>
            </Section>

            <Section icon={Package} title="Composition">
              <p className="text-slate-700 font-medium">{medicine.composition}</p>
            </Section>

            <Section icon={Clock} title="Dosage Guidelines">
               <p className="text-slate-600 leading-relaxed">{medicine.dosage}</p>
            </Section>

            <div className="grid md:grid-cols-2 gap-8">
               <Section icon={AlertTriangle} title="Side Effects" color="text-red-600">
                 <ul className="list-disc list-inside space-y-1 text-slate-600">
                   {medicine.sideEffects.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </Section>
               <Section icon={ShieldCheck} title="Precautions" color="text-emerald-600">
                 <ul className="list-disc list-inside space-y-1 text-slate-600">
                   {medicine.precautions.map((p, i) => <li key={i}>{p}</li>)}
                 </ul>
               </Section>
            </div>

            {medicine.interactions && medicine.interactions.length > 0 && (
              <Section icon={RotateCcw} title="Drug Interactions" color="text-amber-600">
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {medicine.interactions.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
                <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">Note: This is not an exhaustive list. Consult a pharmacist for more info.</p>
              </Section>
            )}

            <Section icon={History} title="Expiry & Storage">
               <div className="flex gap-8 text-sm">
                 <div>
                   <p className="font-bold text-slate-800">Expiry Date</p>
                   <p className="text-slate-500">{medicine.expiry}</p>
                 </div>
                 <div>
                   <p className="font-bold text-slate-800">Storage Info</p>
                   <p className="text-slate-500">{medicine.storage}</p>
                 </div>
               </div>
            </Section>

            {medicine.alternatives && medicine.alternatives.length > 0 && (
              <Section icon={ArrowRight} title="Alternatives (Same Salt)">
                 <div className="grid gap-3">
                   {medicine.alternatives.map(alt => (
                     <div key={alt.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => navigate(`/pharmacy/${alt.id}`)}>
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{alt.name}</p>
                          <p className="text-xs text-emerald-600 mt-1">Generic Variant</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900">₹{alt.price.toFixed(2)}</span>
                          <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                             <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                     </div>
                   ))}
                 </div>
              </Section>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Section: React.FC<{ 
  icon: any, 
  title: string, 
  children: React.ReactNode, 
  color?: string 
}> = ({ icon: Icon, title, children, color = "text-slate-900" }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <h3 className={`font-bold tracking-tight ${color}`}>{title}</h3>
    </div>
    <div className="text-sm">
      {children}
    </div>
  </div>
);

const Clock: React.FC<any> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
