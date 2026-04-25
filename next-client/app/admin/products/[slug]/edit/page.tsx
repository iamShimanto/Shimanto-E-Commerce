import AdminProductUpsertPage from "@/components/admin/products/AdminProductUpsertPage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <AdminProductUpsertPage mode="edit" slug={slug} />;
}
