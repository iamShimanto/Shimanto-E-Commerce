import { Link } from "react-router";
import { useToast } from "../../hooks/useToast";
import Button from "../ui/Button";
import { useAddToCartMutation } from "../../api/cart/cartApi";

export const ProductCard = ({ product }) => {
    const { push } = useToast();
    const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
    const thumbnail =
        product.thumbnail ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop";

    const handleAddToCart = async () => {
        const productId = product?._id;
        const sku = Array.isArray(product?.variants) ? product.variants?.[0]?.sku : "";

        if (!productId || !sku) {
            push({
                title: "Select options",
                message: "Open product details to choose a variant.",
                variant: "warning",
            });
            return;
        }

        try {
            await addToCart({ productId, sku, quantity: 1 }).unwrap();
            push({
                title: "Added to cart",
                description: `${product.title} has been added to your cart.`,
                variant: "success",
            });
        } catch (error) {
            const status = error?.status || error?.originalStatus;
            const message = error?.data?.message || "Failed to add to cart";

            push({
                title: status === 401 ? "Login required" : "Error",
                message:
                    status === 401
                        ? "Please login to add items to cart."
                        : message,
                variant: status === 401 ? "warning" : "error",
            });
        }
    };

    const hasDiscount = Number(product.discountPercentage) > 0;
    const price = Number(product.price || 0);
    const discount = Number(product.discountPercentage || 0);
    const discountedPrice = hasDiscount ? price - (price * discount) / 100 : price;
    const categoryName = product.category?.name || "";

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            <div className="relative aspect-4/5 overflow-hidden bg-gray-100 dark:bg-zinc-900">
                <img
                    src={thumbnail}
                    alt={product.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent opacity-70" />

                {hasDiscount && (
                    <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
                        -{discount}%
                    </div>
                )}

                {categoryName && (
                    <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm dark:bg-black/70 dark:text-gray-200">
                        {categoryName}
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 translate-y-4 px-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                        to={`/products/${product.slug}`}
                        className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100"
                    >
                        View Details
                    </Link>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
                    <Link
                        to={`/products/${product.slug}`}
                        className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        {product.title}
                    </Link>
                </h3>

                {categoryName && (
                    <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {categoryName}
                    </p>
                )}

                <div className="mt-auto flex items-end gap-2 pt-5">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ৳ {discountedPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm font-medium text-gray-400 line-through dark:text-gray-500">
                            ৳ {price.toFixed(2)}
                        </span>
                    )}
                    <Button
                        onClick={handleAddToCart}
                        variant="success"
                        size="sm"
                        className="w-fit ml-auto transition-all duration-300 cursor-pointer"
                        loading={isAdding}
                        disabled={isAdding}
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
        </article>
    );
};