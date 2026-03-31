import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomePage } from "@/pages/HomePage";
import { CoinPage } from "@/pages/CoinPage";

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Go home
      </a>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/coins/:id",
        element: <CoinPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
