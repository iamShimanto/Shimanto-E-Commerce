import { Link, useSearchParams } from "react-router";
import Button from "../components/ui/Button";

const CheckoutFail = () => {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("transactionId");

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-14">
            <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center dark:border-rose-900/50 dark:bg-zinc-950">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    Payment Failed
                </h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Your payment could not be completed. Please try again.
                </p>

                {transactionId ? (
                    <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-200">
                        <span className="font-medium">Transaction:</span> {transactionId}
                    </p>
                ) : null}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/checkout">
                        <Button variant="primary" className="cursor-pointer">Try again</Button>
                    </Link>
                    <Link to="/cart">
                        <Button variant="secondary" className="cursor-pointer">Back to cart</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutFail;
