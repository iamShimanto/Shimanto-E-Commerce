import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Spinner } from "../components/ui/SkeletonLoader";
import { useToast } from "../hooks/useToast";
import { useGetCartQuery } from "../api/cart/cartApi";
import { useCheckoutMutation } from "../api/order/orderApi";
import { cartApi } from "../api/cart/cartApi";
import { useDispatch } from "react-redux";
import { useProfileQuery } from "../api/auth/authApi";

const INSIDE_DHAKA_CHARGE = Number(
  import.meta.env.VITE_INSIDE_DHAKA_CHARGE ?? 80,
);
const OUTSIDE_DHAKA_CHARGE = Number(
  import.meta.env.VITE_OUTSIDE_DHAKA_CHARGE ?? 120,
);

const money = (amount) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return "৳ 0.00";
  return `৳ ${value.toFixed(2)}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { push } = useToast();
  const [insideDhaka, setInsideDhaka] = useState(true);

  const { data: profileData } = useProfileQuery();
  const user = profileData?.data || profileData?.user || null;

  const {
    data: cart,
    isLoading: cartLoading,
    error: cartError,
  } = useGetCartQuery();

  const [checkout, { isLoading: placing }] = useCheckoutMutation();

  const items = useMemo(
    () => (Array.isArray(cart?.items) ? cart.items : []),
    [cart?.items],
  );

  const subTotal = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i?.subTotal || 0), 0);
  }, [items]);

  const shippingCharge = useMemo(
    () => (insideDhaka ? INSIDE_DHAKA_CHARGE : OUTSIDE_DHAKA_CHARGE),
    [insideDhaka],
  );

  const estimatedTotal = useMemo(
    () => subTotal + shippingCharge,
    [shippingCharge, subTotal],
  );

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (!user) return;
    setFullName((prev) => prev || user?.fullName || "");
    setPhone((prev) => prev || user?.phone || "");
    setEmail((prev) => prev || user?.email || "");
    setAddress((prev) => prev || user?.address || "");
  }, [user]);

  const isEmpty =
    (cartError?.status === 404 || cartError?.originalStatus === 404) ||
    items.length === 0;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const payload = {
      shippingAddress: {
        fullName: String(fullName || "").trim(),
        phone: String(phone || "").trim(),
        email: String(email || "").trim(),
        address: String(address || "").trim(),
      },
      paymentMethod,
      insideDhaka,
    };

    if (!payload.shippingAddress.fullName || !payload.shippingAddress.phone || !payload.shippingAddress.address) {
      push({
        title: "Missing info",
        message: "Full name, phone, and address are required.",
        variant: "warning",
      });
      return;
    }

    if (isEmpty) {
      push({
        title: "Cart is empty",
        message: "Add items to cart before checkout.",
        variant: "warning",
      });
      navigate("/cart");
      return;
    }

    try {
      const res = await checkout(payload).unwrap();
      const data = res?.data;

      dispatch(cartApi.util.invalidateTags(["Cart"]));

      const method = String(paymentMethod || "cod").toLowerCase();
      if (method === "cod") {
        const orderId = data?._id;
        if (orderId) {
          navigate(`/checkout/placed?orderId=${encodeURIComponent(orderId)}`);
        } else {
          navigate("/checkout/placed");
        }
        return;
      }

      if (method === "stripe") {
        const checkoutUrl = data?.checkoutUrl;
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
        throw new Error("Stripe checkout URL missing");
      }

      if (method === "sslcommerz") {
        const gatewayPageUrl = data?.gatewayPageUrl;
        if (gatewayPageUrl) {
          window.location.assign(gatewayPageUrl);
          return;
        }
        throw new Error("SSLCommerz gateway URL missing");
      }

      throw new Error("Invalid payment method");
    } catch (err) {
      push({
        title: "Checkout failed",
        message: err?.data?.message || err?.message || "Could not place order",
        variant: "error",
      });
    }
  };

  if (cartLoading) return <Spinner />;

  return (
    <div className="container px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm">
          Enter shipping details and choose a payment method.
        </p>
      </div>

      {isEmpty ? (
        <div className="rounded-3xl border p-10 text-center">
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm">
            Please add products before checkout.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            >
              Browse products
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition"
            >
              Back to cart
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-2">
            <div className="rounded-3xl border p-5">
              <h2 className="text-lg font-semibold">Shipping Address</h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
                <Input
                  label="Phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
                <Input
                  label="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, road, area"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={insideDhaka}
                    onChange={(e) => setInsideDhaka(e.target.checked)}
                  />
                  Inside Dhaka delivery
                </label>
              </div>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border p-5">
              <h2 className="text-lg font-semibold">Payment Method</h2>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery (COD)</p>
                    <p className="text-sm">Pay when you receive the product.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Stripe (Card)</p>
                    <p className="text-sm">Pay securely using your card.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
                  <input
                    type="radio"
                    name="payment"
                    value="sslcommerz"
                    checked={paymentMethod === "sslcommerz"}
                    onChange={() => setPaymentMethod("sslcommerz")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">SSLCommerz</p>
                    <p className="text-sm">
                      Pay with bKash / Nagad / card (gateway).
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border p-5 h-fit">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{money(subTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{money(shippingCharge)}</span>
                </div>
                <div className="h-px" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-base font-bold">
                    {money(estimatedTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  type="submit"
                  loading={placing}
                  disabled={placing}
                  className="cursor-pointer border"
                  onClick={handlePlaceOrder}
                >
                  {placing ? "Processing..." : "Place Order"}
                </Button>

                <Link
                  to="/cart"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Back to cart
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Checkout;