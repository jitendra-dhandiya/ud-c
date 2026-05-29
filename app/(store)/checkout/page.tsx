'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Container, Grid, Typography, TextField, Button,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Card, CardContent, Stack, Divider, Stepper, Step, StepLabel,
  CircularProgress,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../../../hooks/useCart';
import { orderApi, paymentApi, userApi } from '../../../services/api.service';
import { formatPrice } from '../../../utils/format';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '../../../constants';
import { useAppSelector } from '../../../store';
import type { Address } from '../../../types';
import toast from 'react-hot-toast';

const addressSchema = Yup.object({
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),
  addressLine1: Yup.string().required('Required'),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  pincode: Yup.string().required('Required'),
});

declare global { interface Window { Razorpay: any } }

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const couponDiscount = Number(searchParams.get('discount') || 0);
  const couponCode = searchParams.get('coupon') || undefined;

  const shippingCharge = subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_CHARGE : 0;
  const total = subtotal - couponDiscount + shippingCharge;

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/checkout'); return; }
    userApi.getAddresses().then(({ data }) => {
      setSavedAddresses(data.data || []);
      const def = data.data?.find((a: Address) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    });
  }, [isAuthenticated, router]);

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (shippingAddress: object) => {
    if (!cart?.items.length) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    try {
      const { data: orderData } = await orderApi.create({
        addressId: selectedAddressId || undefined,
        paymentMethod,
        couponCode,
        shippingAddress,
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      const order = orderData.data;

      if (paymentMethod === 'COD') {
        await clearCart();
        router.push(`/order-success?orderNumber=${order.orderNumber}`);
        return;
      }

      // Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      const { data: rpData } = await paymentApi.createRazorpayOrder(order.id);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rpData.data.amount,
        currency: rpData.data.currency,
        order_id: rpData.data.razorpayOrderId,
        name: 'LUXÉ Fashion',
        description: `Order ${order.orderNumber}`,
        prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email, contact: user?.phone },
        theme: { color: '#1a1a1a' },
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              ...response,
              orderId: order.id,
            });
            await clearCart();
            router.push(`/order-success?orderNumber=${order.orderNumber}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => toast.error('Payment cancelled') },
      };

      new window.Razorpay(options).open();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: { xs: 10, md: 6 } }}>
      <Typography variant="h4" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Left — address + payment */}
        <Grid item xs={12} md={7} lg={8}>
          <Formik
            initialValues={{
              firstName: user?.firstName || '', lastName: user?.lastName || '',
              phone: user?.phone || '', addressLine1: '', addressLine2: '',
              city: '', state: '', pincode: '', country: 'India',
            }}
            validationSchema={selectedAddressId ? undefined : addressSchema}
            onSubmit={(values) => handlePlaceOrder(values)}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Saved Addresses</Typography>
                      <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                        {savedAddresses.map((addr) => (
                          <FormControlLabel
                            key={addr.id}
                            value={addr.id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {addr.firstName} {addr.lastName} — {addr.type}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                                </Typography>
                              </Box>
                            }
                            sx={{ mb: 1, alignItems: 'flex-start', '& .MuiRadio-root': { mt: -0.5 } }}
                          />
                        ))}
                        <FormControlLabel value="" control={<Radio />} label="Use a new address" />
                      </RadioGroup>
                    </CardContent>
                  </Card>
                )}

                {/* New address form */}
                {!selectedAddressId && (
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                        {savedAddresses.length > 0 ? 'New Address' : 'Delivery Address'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Field as={TextField} name="firstName" label="First Name" fullWidth size="small"
                            error={touched.firstName && !!errors.firstName} helperText={touched.firstName && errors.firstName} />
                        </Grid>
                        <Grid item xs={6}>
                          <Field as={TextField} name="lastName" label="Last Name" fullWidth size="small"
                            error={touched.lastName && !!errors.lastName} helperText={touched.lastName && errors.lastName} />
                        </Grid>
                        <Grid item xs={12}>
                          <Field as={TextField} name="phone" label="Phone Number" fullWidth size="small"
                            error={touched.phone && !!errors.phone} helperText={touched.phone && errors.phone} />
                        </Grid>
                        <Grid item xs={12}>
                          <Field as={TextField} name="addressLine1" label="Address Line 1" fullWidth size="small"
                            error={touched.addressLine1 && !!errors.addressLine1} helperText={touched.addressLine1 && errors.addressLine1} />
                        </Grid>
                        <Grid item xs={12}>
                          <Field as={TextField} name="addressLine2" label="Address Line 2 (Optional)" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={5}>
                          <Field as={TextField} name="city" label="City" fullWidth size="small"
                            error={touched.city && !!errors.city} helperText={touched.city && errors.city} />
                        </Grid>
                        <Grid item xs={4}>
                          <Field as={TextField} name="state" label="State" fullWidth size="small"
                            error={touched.state && !!errors.state} helperText={touched.state && errors.state} />
                        </Grid>
                        <Grid item xs={3}>
                          <Field as={TextField} name="pincode" label="Pincode" fullWidth size="small"
                            error={touched.pincode && !!errors.pincode} helperText={touched.pincode && errors.pincode} />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Payment */}
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payment Method</Typography>
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <FormControlLabel value="COD" control={<Radio />}
                        label={<Box><Typography variant="body2" fontWeight={600}>Cash on Delivery</Typography>
                          <Typography variant="caption" color="text.secondary">Pay when you receive</Typography></Box>}
                        sx={{ mb: 1 }}
                      />
                      <FormControlLabel value="RAZORPAY" control={<Radio />}
                        label={<Box><Typography variant="body2" fontWeight={600}>Pay Online</Typography>
                          <Typography variant="caption" color="text.secondary">Cards, UPI, Net Banking, Wallets</Typography></Box>}
                      />
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button
                  type="submit" fullWidth variant="contained" size="large"
                  disabled={loading}
                  sx={{ bgcolor: '#1a1a1a', py: 2, fontSize: '0.85rem', letterSpacing: '0.12em', fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Place Order — ${formatPrice(total)}`}
                </Button>
              </Form>
            )}
          </Formik>
        </Grid>

        {/* Order summary */}
        <Grid item xs={12} md={5} lg={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'sticky', top: 88 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Order Summary</Typography>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {cart?.items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{
                        bgcolor: '#1a1a1a', color: 'white', borderRadius: '50%',
                        width: 18, height: 18, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.6rem', flexShrink: 0,
                      }}>
                        {item.quantity}
                      </Typography>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{item.product?.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{formatPrice(item.price * item.quantity)}</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{formatPrice(subtotal)}</Typography>
                </Box>
                {couponDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main">Discount</Typography>
                    <Typography variant="body2" color="success.main">-{formatPrice(couponDiscount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2" sx={{ color: shippingCharge === 0 ? 'success.main' : 'inherit' }}>
                    {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={800}>Total</Typography>
                  <Typography fontWeight={800} fontSize="1.1rem">{formatPrice(total)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
