import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/SkeletonLoader";
import { useGetOrderByIdQuery } from "../api/order/orderApi";
import { useDispatch } from "react-redux";
import { cartApi } from "../api/cart/cartApi";

const money = (amount) => {
    const value = Number(amount || 0);
    if (!Number.isFinite(value)) return "৳ 0.00";
    return `৳ ${value.toFixed(2)}`;
};

const CheckoutPlaced = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const transactionId = searchParams.get("transactionId");
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(cartApi.util.invalidateTags(["Cart"]));
        dispatch(
            cartApi.util.upsertQueryData("getCart", undefined, {
                items: [],
                totalItems: 0,
            }),
        );
    }, [dispatch]);

    const { data: order, isLoading } = useGetOrderByIdQuery(orderId, {
        skip: !orderId,
    });

    if (isLoading) return <Spinner />;

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
            <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center dark:border-emerald-900/50 dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Order Placed
                </h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Your order has been placed successfully. Payment method: COD.
                </p>

                {orderId ? (
                    <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                        <p className="text-zinc-700 dark:text-zinc-200">
                            <span className="font-medium">Order ID:</span> {orderId}
                        </p>
                        {(transactionId || order?.transactionId) ? (
                            <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                                <span className="font-medium">Transaction:</span> {transactionId || order?.transactionId}
                            </p>
                        ) : null}
                        {order?.totalAmount != null ? (
                            <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                                <span className="font-medium">Total:</span> {money(order.totalAmount)}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/products">
                        <Button variant="primary" className="cursor-pointer">Continue shopping</Button>
                    </Link>
                    <Link to="/cart">
                        <Button variant="secondary" className="cursor-pointer">Go to cart</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPlaced;
