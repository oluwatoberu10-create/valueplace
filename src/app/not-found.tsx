import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-cream px-6 py-20 text-center">
      <h1 className="font-display text-5xl text-wine-800">Page not found</h1>
      <p className="mt-3 text-lg text-ink-soft">The page you&apos;re looking for isn&apos;t on our table.</p>
      <Link href="/menu" className="btn btn-primary mt-6">
        See the Menu
      </Link>
    </main>
  );
}
