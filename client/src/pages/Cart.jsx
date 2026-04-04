import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Spinner } from "../components/ui/SkeletonLoader";
import Button from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartMutation,
} from "../api/cart/cartApi";

const money = (amount) => {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return "৳ 0.00";
  return `৳ ${value.toFixed(2)}`;
};

const getProductSnapshot = (item) => {
  const product = item?.product;
  if (product && typeof product === "object") {
    return {
      id: product._id,
      title: product.title,
      slug: product.slug,
      thumbnail: product.thumbnail,
    };
  }

  return { id: product, title: "Product", slug: null, thumbnail: null };
};

const Cart = () => {
  const navigate = useNavigate();
  const { push } = useToast();

  const {
    data: cart,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCartQuery();

  const [updateCart] = useUpdateCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: clearing }] = useClearCartMutation();

  const [pendingSku, setPendingSku] = useState(null);
  const items = useMemo(
    () => (Array.isArray(cart?.items) ? cart.items : []),
    [cart],
  );

  const subTotal = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i?.subTotal || 0), 0);
  }, [items]);

  const totalItems = cart?.totalItems ?? items.reduce((a, i) => a + (i?.quantity || 0), 0);

  const isEmpty =
    (error?.status === 404 || error?.originalStatus === 404) ||
    items.length === 0;

  const handleQty = async (item, nextQty) => {
    const sku = item?.sku;
    const productId =
      (typeof item?.product === "object" ? item?.product?._id : item?.product) ??
      null;

    if (!sku || !productId) return;

    const quantity = Number(nextQty);
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setPendingSku(sku);
    try {
      await updateCart({ productId, sku, quantity }).unwrap();
    } catch (e) {
      push({
        title: "Update failed",
        message: e?.data?.message || "Could not update cart quantity",
        variant: "error",
      });
    } finally {
      setPendingSku(null);
    }
  };

  const handleRemove = async (item) => {
    const sku = item?.sku;
    const productId =
      (typeof item?.product === "object" ? item?.product?._id : item?.product) ??
      null;

    if (!sku || !productId) return;

    setPendingSku(sku);
    try {
      await removeFromCart({ productId, sku }).unwrap();
      push({
        title: "Removed",
        message: "Item removed from cart",
        variant: "success",
      });
    } catch (e) {
      push({
        title: "Remove failed",
        message: e?.data?.message || "Could not remove item",
        variant: "error",
      });
    } finally {
      setPendingSku(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart().unwrap();
      push({
        title: "Cart cleared",
        message: "Your cart is now empty",
        variant: "success",
      });
    } catch (e) {
      push({
        title: "Clear failed",
        message: e?.data?.message || "Could not clear cart",
        variant: "error",
      });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {totalItems ? `${totalItems} item(s) in your cart` : "Your cart"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClear}
            disabled={clearing || isEmpty}
          >
            {clearing ? "Clearing..." : "Clear cart"}
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Add some products to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const snap = getProductSnapshot(item);
                const sku = item?.sku;
                const qty = Number(item?.quantity || 1);
                const lineTotal = Number(item?.subTotal || 0);
                const unitPrice = qty > 0 ? lineTotal / qty : 0;
                const isPending = pendingSku === sku;

                const thumb =
                  snap.thumbnail ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop";

                return (
                  <div
                    key={`${sku}-${snap.id ?? "item"}`}
                    className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex gap-4">
                      <Link
                        to={snap.slug ? `/products/${snap.slug}` : "/products"}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900"
                      >
                        <img
                          src={thumb}
                          alt={snap.title || "Product"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={snap.slug ? `/products/${snap.slug}` : "/products"}
                              className="block truncate text-base font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                            >
                              {snap.title || "Product"}
                            </Link>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              SKU: {sku}
                            </p>
                            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                              Unit: {money(unitPrice)}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item)}
                            disabled={isPending}
                            aria-label="Remove"
                            className="cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQty(item, qty - 1)}
                              disabled={qty <= 1 || isPending}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 transition disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                            >
                              <Minus size={16} />
                            </button>

                            <input
                              type="number"
                              min={1}
                              value={Number.isFinite(qty) ? qty : 1}
                              onChange={(e) => {
                                const next = Number(e.target.value);
                                if (!Number.isFinite(next)) return;
                                handleQty(item, next);
                              }}
                              disabled={isPending}
                              className="h-9 w-20 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                            />

                            <button
                              type="button"
                              onClick={() => handleQty(item, qty + 1)}
                              disabled={isPending}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 transition disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                            >
                              <Plus size={16} />
                            </button>

                            {isPending ? (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Updating...
                              </span>
                            ) : null}
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Line total
                            </p>
                            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                              {money(lineTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Order Summary
            </h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-200">
                <span>Subtotal</span>
                <span className="font-medium">{money(subTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center justify-between text-zinc-900 dark:text-zinc-50">
                <span className="font-semibold">Estimated Total</span>
                <span className="text-base font-bold">{money(subTotal)}</span>
              </div>
            </div>

            <Button
              className="mt-6 cursor-pointer"
              fullWidth
              onClick={() => navigate("/checkout")}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </Button>

            <Link
              to="/products"
              className="mt-3 block text-center text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;