import Link from '../components/Link';

export function NotFound() {
  return (
    <div class="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 lg:px-8 sm:px-6">
      <div class="mx-auto max-w-md flex justify-center text-center">
        <h1 class="text-foreground mt-8 text-6xl font-bold tracking-tight sm:text-7xl">404</h1>
        <p class="text-muted-foreground mt-4 text-lg">
          Oops, it looks like the page you're looking for doesn't exist. Please check the URL or go
          back to the homepage.
        </p>
        <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="#"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
