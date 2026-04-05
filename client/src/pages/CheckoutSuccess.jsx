import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Button from "../components/ui/Button";
import { useDispatch } from "react-redux";
import { cartApi } from "../api/cart/cartApi";

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
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

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
            <div className="rounded-3xl border border-emerald-200 bg-white p-10 text-center dark:border-emerald-900/50 dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Payment Successful
                </h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Thanks! Your payment has been received.
                </p>

                {(transactionId || sessionId) && (
                    <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                        {transactionId ? (
                            <p className="text-zinc-700 dark:text-zinc-200">
                                <span className="font-medium">Transaction ID:</span> {transactionId}
                            </p>
                        ) : null}
                        {sessionId ? (
                            <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                                <span className="font-medium">Stripe session:</span> {sessionId}
                            </p>
                        ) : null}
                    </div>
                )}

                <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
                    Order confirmation may take a moment to update.
                </p>

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

export default CheckoutSuccess;
