import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicine } from '../../MedicineContext';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard,
  History
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';

export const MedicineCart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useMedicine();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          Looks like you haven't added any medicines yet. Search our pharmacy for the medicines you need.
        </p>
        <Button 
          onClick={() => navigate('/pharmacy')}
          className="mt-8 bg-emerald-600 hover:bg-emerald-700 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-emerald-100"
        >
          Browse Medicines
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pharmacy')} className="rounded-full hover:bg-emerald-50 text-emerald-600">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shopping <span className="text-emerald-600">Cart</span></h1>
        </div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border-none font-bold">
          {cart.length} ITEMS
        </Badge>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ScrollArea className="h-[calc(100vh-350px)] pr-6">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <motion.div
                  key={item.medicine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="rounded-[2rem] border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-stretch flex-col sm:flex-row">
                        <div className="sm:w-48 aspect-square relative bg-slate-50">
                          <img 
                            src={item.medicine.image} 
                            alt={item.medicine.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-2xl font-bold text-slate-900">{item.medicine.name}</h3>
                              <p className="text-emerald-600 font-medium text-sm mt-1">{item.medicine.brandName}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-300 hover:text-red-500 transition-colors"
                              onClick={() => removeFromCart(item.medicine.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-8">
                            <div className="flex items-center gap-4 bg-slate-100 rounded-2xl p-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl hover:bg-white"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl hover:bg-white"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                              ₹{(item.medicine.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white sticky top-24 overflow-hidden border-2 border-emerald-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
                Order <span className="text-emerald-600">Summary</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 px-2 rounded flex items-center">Free</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>GST (Included)</span>
                  <span className="text-slate-900">₹0.00</span>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-xl font-bold text-slate-900">Total</span>
                  <span className="text-4xl font-black text-emerald-600">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <Button 
                  onClick={() => navigate('/pharmacy/checkout')}
                  className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-100"
                >
                  Proceed to Checkout
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Secured by Razorpay</span>
                </div>
              </div>
            </CardContent>
            <div className="bg-emerald-50/50 p-6 flex items-center gap-4">
               <History className="h-5 w-5 text-emerald-600 shrink-0" />
               <p className="text-[11px] text-emerald-800 leading-tight">
                 Your purchase contributes to child healthcare initiatives in Srikakulam.
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
