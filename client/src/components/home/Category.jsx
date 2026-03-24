import { Link } from "react-router";
import { useGetCategoriesQuery } from "../../api/category/categoryApi";

const Category = () => {
    const { data: apiCategories = [], isLoading, isError } = useGetCategoriesQuery();
    console.log(apiCategories);
    const categories =
        Array.isArray(apiCategories) && apiCategories.length > 0
            ? apiCategories.map((category) => ({
                id: category._id || category.id,
                name: category.name,
                slug: category.slug,
                image:
                    category?.thumbnail ||
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
                description:`Explore our ${category.name} collection`,
            }))
            : [];

    if (isLoading) {
        return (
            <section className="w-full py-14 md:py-20 text-black">
                <div className="container px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center md:mb-12">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Explore Our Categories
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base">
                            Loading categories...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="w-full py-14 md:py-20">
                <div className="container px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center md:mb-12">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Explore Our Categories
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm text-red-500 md:text-base">
                            Failed to load categories.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full py-14 md:py-20">
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center md:mb-12">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Explore Our Categories
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base">
                        Discover curated fashion collections from our latest categories.
                    </p>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center text-sm">
                        No categories found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/shop?category=${category.slug}`}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="relative h-80 w-full overflow-hidden">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 from-black/70 via-black/20 to-transparent" />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-6 text-black font-semibold">
                                    <h3 className="text-2xl font-bold">
                                        {category.name}
                                    </h3>
                                    <p className="mt-2 text-sm">
                                        {category.description}
                                    </p>

                                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-black text-white rounded hover:bg-black/90 transition-colors duration-300">
                                        Shop Now
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Category;