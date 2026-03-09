import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import ProfileSetupGuard from "./components/ProfileSetupGuard";
import MediaPage from "./pages/MediaPage";
import QAPage from "./pages/QAPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <ProfileSetupGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </footer>
      </div>
      <Toaster position="top-right" richColors />
    </ProfileSetupGuard>
  ),
});

const qaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: QAPage,
});

const questionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/question/$id",
  component: QuestionDetailPage,
});

const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/media",
  component: MediaPage,
});

const routeTree = rootRoute.addChildren([
  qaRoute,
  questionDetailRoute,
  mediaRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
