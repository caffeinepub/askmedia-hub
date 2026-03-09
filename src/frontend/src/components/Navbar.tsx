import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Image as ImageIcon,
  Loader2,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useCallerUserProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3 max-w-6xl">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center shadow-teal">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground group-hover:text-teal transition-colors">
            AskMedia Hub
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            activeProps={{ className: "text-teal bg-teal/10" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            data-ocid="nav.qa_link"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Q&amp;A</span>
          </Link>
          <Link
            to="/media"
            activeProps={{ className: "text-teal bg-teal/10" }}
            inactiveProps={{
              className:
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            data-ocid="nav.media_link"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Media</span>
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-teal/30">
                <AvatarFallback className="bg-teal/20 text-teal text-xs font-bold">
                  {profile?.name ? (
                    profile.name[0].toUpperCase()
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </AvatarFallback>
              </Avatar>
              {profile?.name && (
                <span className="hidden md:inline text-sm text-muted-foreground max-w-[120px] truncate">
                  {profile.name}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="sm"
              className="bg-teal hover:bg-teal/90 text-primary-foreground font-medium shadow-teal"
              data-ocid="nav.login_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  Logging in…
                </>
              ) : (
                "Log In"
              )}
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
