import StoreHeader from "@/components/layout/StoreHeader";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <StoreHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
