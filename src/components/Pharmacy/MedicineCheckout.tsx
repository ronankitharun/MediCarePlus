import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicine } from '../../MedicineContext';
import { useAuth } from '../../AuthContext';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  CircleCheck, 
  ShieldCheck, 
  Truck,
  Building
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';

export const MedicineCheckout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useMedicine();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    phone: '',
    street: '',
    city: 'Srikakulam',
    state: 'Andhra Pradesh',
    pincode: '532001'
  });
  
  const [deliverySlot, setDeliverySlot] = useState('Standard (24-48 Hours)');

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.pincode) {
       toast.error("Please fill all contact and address fields");
       return;
    }

    if (!/^\d{10}$/.test(address.phone)) {
       toast.error("Please enter a valid 10-digit phone number");
       return;
    }

    try {
      setIsProcessing(true);
      
      // 1. Create Razorpay Order
      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal }),
      });
      
      if (!orderRes.ok) throw new Error('Failed to create payment order');
      const orderData = await orderRes.json();

      // 2. Open Razorpay Checkout
      const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKey) {
        setIsProcessing(false);
        toast.error("Razorpay Key ID is not configured in environment variables.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ArogyaLink Pharmacy',
        description: `Order for ${cart.length} medicine(s)`,
        order_id: orderData.id,
        handler: async (response: any) => {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            await finalizeOrder(response.razorpay_payment_id, orderData.id);
          } else {
            toast.error('Payment verification failed');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        theme: { color: '#059669' },
        modal: { ondismiss: () => setIsProcessing(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order');
      setIsProcessing(false);
    }
  };

  const finalizeOrder = async (paymentId: string, razorpayOrderId: string) => {
    try {
      const orderData = {
        userId: user?.uid || 'anonymous',
        userName: address.fullName,
        userEmail: user?.email || 'N/A',
        items: cart.map(item => ({
          medicineId: item.medicine.id,
          name: item.medicine.name,
          quantity: item.quantity,
          price: item.medicine.price
        })),
        totalAmount: cartTotal,
        status: 'pending',
        address,
        deliverySlot,
        paymentStatus: 'paid',
        paymentId,
        razorpayOrderId,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'pharmacy_orders'), orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/dashboard'); // or a success page
    } catch (error) {
       console.error('Finalize order error:', error);
       toast.error('Failed to save order details');
    } finally {
       setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    navigate('/pharmacy');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pharmacy/cart')} className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                   <MapPin className="h-6 w-6 text-emerald-600" />
                   Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                    <Input 
                      id="address-name" 
                      className="rounded-xl border-slate-200 h-12" 
                      value={address.fullName}
                      onChange={e => setAddress({...address, fullName: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address-phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</Label>
                    <Input 
                      id="address-phone" 
                      className="rounded-xl border-slate-200 h-12" 
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address-street" className="text-xs font-bold uppercase tracking-wider text-slate-500">Street Address</Label>
                    <Input 
                      id="address-street" 
                      className="rounded-xl border-slate-200 h-12" 
                      placeholder="House No, Building, Area"
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</Label>
                      <Input value={address.city} readOnly className="bg-slate-50/50 rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pincode</Label>
                      <Input 
                        className="rounded-xl border-slate-200 h-12"
                        value={address.pincode}
                        onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g, '')})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
               <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-3 text-slate-900">
                     <Clock className="h-6 w-6 text-emerald-600" />
                     Delivery Slot
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <Select value={deliverySlot} onValueChange={setDeliverySlot}>
                    <SelectTrigger className="h-14 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard (24-48 Hours)">Standard (24-48 Hours)</SelectItem>
                      <SelectItem value="Express (Within 12 Hours)">Express (Within 12 Hours)</SelectItem>
                      <SelectItem value="Economy (3-4 Days)">Economy (3-4 Days)</SelectItem>
                    </SelectContent>
                  </Select>
               </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-slate-100 shadow-2xl shadow-slate-200/50 border-2 border-emerald-50 overflow-hidden sticky top-24">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-2xl font-bold flex items-center justify-between">
                   <span>Review Items</span>
                   <Badge variant="secondary">{cart.length}</Badge>
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4 max-h-60 overflow-y-auto mb-8 pr-2">
                  {cart.map(item => (
                    <div key={item.medicine.id} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-white">
                          <img src={item.medicine.image} alt={item.medicine.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 leading-none">{item.medicine.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">₹{(item.medicine.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Order Total</span>
                    <span className="text-slate-900 font-bold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <Separator className="my-6" />
                  <div className="flex justify-between items-baseline mb-8">
                    <span className="text-xl font-bold text-slate-900">Final Payable</span>
                    <span className="text-3xl font-black text-emerald-600">₹{cartTotal.toFixed(2)}</span>
                  </div>

                  <Button 
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-100"
                  >
                    {isProcessing ? 'Processing Transaction...' : 'Pay with Razorpay'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                      SSL Secured
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      <Truck className="h-4 w-4" />
                      Safe Delivery
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
