export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="font-body text-on-surface"
      style={{ backgroundColor: "#0A0A0C" }}
    >
      {children}
    </div>
  );
}
