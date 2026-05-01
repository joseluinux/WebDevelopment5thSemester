export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 pb-20"
      style={{
        backgroundColor: "#0A0A0C",
        backgroundImage:
          "radial-gradient(circle at 50% -20%, #1c1b1d 0%, #0A0A0C 100%)",
      }}
    >
      {children}
    </div>
  );
}
