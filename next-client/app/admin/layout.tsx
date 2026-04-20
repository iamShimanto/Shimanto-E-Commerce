export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
