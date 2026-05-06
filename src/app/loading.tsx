export default function Loading() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-border border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground/70 animate-pulse">Loading BhagyaSreeBorse...</p>
      </div>
    </div>
  );
}
