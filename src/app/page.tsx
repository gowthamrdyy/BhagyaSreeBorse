import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-10 px-6 py-16">
        <div className="space-y-4">
          <p className="inline-flex rounded-md border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            TimetableX
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Minimal academic workspace for everyday student tasks.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A clean and simple portal to check timetable, marks, attendance, and exams without visual clutter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-md border border-border bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Login
          </Link>
          <Link
            href="/app/dashboard"
            className="rounded-md border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
