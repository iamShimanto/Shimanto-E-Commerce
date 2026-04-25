import AdminProductDetailsPage from "@/components/admin/products/AdminProductDetailsPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <AdminProductDetailsPage slug={slug} />;
}
