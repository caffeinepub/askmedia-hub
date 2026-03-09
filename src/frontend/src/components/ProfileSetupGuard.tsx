import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

interface Props {
  children: ReactNode;
}

export default function ProfileSetupGuard({ children }: Props) {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");

  // Only show the prompt when: logged in + profile loaded + no name set yet
  const needsProfile =
    isLoggedIn && !profileLoading && profile !== null && !profile?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Profile saved! Welcome to AskMedia Hub.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (isInitializing || (isLoggedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-card teal-glow">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
              <User className="w-8 h-8 text-teal" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Welcome!
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Choose a display name before you can post questions, answers, or
              media.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice Chen"
                maxLength={50}
                className="bg-muted/30 border-border focus-visible:ring-teal"
                data-ocid="profile_setup.input"
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || saveProfile.isPending}
              className="w-full bg-teal hover:bg-teal/90 text-primary-foreground font-semibold shadow-teal"
              data-ocid="profile_setup.submit_button"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving…
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
