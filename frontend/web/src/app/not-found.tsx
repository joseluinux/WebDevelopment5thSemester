import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-obsidian-bg flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <p className="text-accent/30 font-display font-bold text-[8rem] leading-none select-none">
        404
      </p>
      <h1 className="font-display text-display-sm font-bold text-on-surface mt-4 mb-2">
        Page not found
      </h1>
      <p className="text-on-muted text-sm max-w-sm mb-8">
        The resource you requested could not be located. It may have been moved,
        deleted, or never existed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="px-5 py-2 rounded-lg border border-obsidian-elevated text-on-muted font-semibold text-sm hover:text-on-surface transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
