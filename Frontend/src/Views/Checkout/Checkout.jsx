import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingBag, MapPin, CreditCard, Package, Truck, ChevronRight } from "lucide-react";
import OrderService from "@/services/orderService";
import PaymentService from "@/services/paymentService";
import CouponService from "@/services/couponService";
import { clearCart } from "@/redux/slices/cartSlice";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems, totalAmount } = useSelector((state) => state.cart);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/products");
    }

    // Set default address if available
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(addr => addr.isDefault);
      setSelectedAddress(defaultAddr || user.addresses[0]);
    }
  }, [cartItems, navigate, user]);

  const finalAmount = totalAmount - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);
      const { data } = await CouponService.validateCoupon({
        code: couponCode.trim(),
        orderValue: totalAmount,
      });

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.discountAmount);
        toast.success(`Coupon applied! You saved ₹${data.discountAmount}`);
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      toast.error(error?.data?.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: "razorpay", // Only Razorpay payment is available
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      // Create order
      const { data: orderData } = await OrderService.createOrder(orderPayload);
      
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const order = orderData.order;

      // All payments use Razorpay
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      if (!razorpayKeyId) {
        toast.error("Payment gateway is not configured. Please contact support.");
        setLoading(false);
        return;
      }

      try {
        // Create Razorpay order
        const { data: paymentData } = await PaymentService.createRazorpayOrder({
          amount: order.finalPrice,
          currency: "INR",
          receipt: order._id,
        });

        if (!paymentData.success) {
          throw new Error("Failed to initiate payment");
        }

        // Load Razorpay SDK dynamically
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: razorpayKeyId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: "Zauq",
            description: "Order Payment",
            order_id: paymentData.orderId,
            handler: async function (response) {
              try {
                // Verify payment
                await PaymentService.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id,
                });

                toast.success("Payment successful! Order placed.");
                dispatch(clearCart());
                navigate("/profile");
              } catch (error) {
                console.error("Payment verification error:", error);
                toast.error("Payment verification failed");
              }
            },
            prefill: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              contact: selectedAddress.phone,
            },
            theme: {
              color: "#9333ea",
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();

          razorpay.on("payment.failed", function (response) {
            toast.error("Payment failed. Please try again.");
            setLoading(false);
          });
        };

        script.onerror = () => {
          toast.error("Failed to load payment gateway");
          setLoading(false);
        };
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-text-primary py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
              </div>

              {user?.addresses?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-brand-primary hover:text-brand-primary  font-medium"
                  >
                    Add Address in Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {user?.addresses?.map((address, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedAddress(address)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedAddress === address
                          ? "border-brand-primary bg-brand-primary-light"
                          : "border-gray-200 hover:border-brand-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{address.name}</h4>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-brand-primary-light text-brand-secondary border border-brand-secondary rounded-full text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-sm text-gray-700">
                            {address.address}, {address.city}
                            {address.state && `, ${address.state}`} - {address.postalCode}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddress === address
                              ? "border-brand-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddress === address && (
                            <div className="w-3 h-3 rounded-full bg-brand-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="border-2 rounded-xl p-4 border-brand-primary bg-brand-primary-light">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 32" className="w-10 h-6">
                      <path fill="#072654" d="M20 0H4a4 4 0 00-4 4v24a4 4 0 004 4h16V0z"/>
                      <path fill="#3395FF" d="M58 0H20v32h38V0z"/>
                      <path fill="#fff" d="M42.5 16c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Razorpay Secure Payment</h3>
                    <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking & more</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-brand-primary flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-brand-primary" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map((method) => (
                    <span key={method} className="px-2 py-1 bg-white/60 rounded text-xs text-gray-700">{method}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">You'll be redirected to Razorpay's secure payment gateway to complete your payment.</p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3 pb-3 border-b">
                    <img
                      src={item.product.images?.[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-brand-primary">₹{Math.round(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-4 pb-4 border-b">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon code?
                </label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary-dark disabled:opacity-50"
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-green-700">
                      {appliedCoupon.code} applied!
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Math.round(totalAmount).toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- ₹{Math.round(discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{Math.round(finalAmount).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full bg-brand-primary text-white rounded-xl py-3 font-semibold hover:bg-brand-primary-dark disabled:opacity-50 transition-all"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
