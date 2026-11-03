export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <div className="flex-1">{children}</div>
    </div>
  );
}
