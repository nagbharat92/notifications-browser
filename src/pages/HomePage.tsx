import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicShadowCard } from "@/components/DynamicShadowCard";
import { TitleOnlyNotificationCard } from "@/components/TitleOnlyNotificationCard";
import { TitleDescriptionNotificationCard } from "@/components/TitleDescriptionNotificationCard";
import { TitleBodyImageNotificationCard } from "@/components/TitleBodyImageNotificationCard";
import { TitleBodyActionsNotificationCard } from "@/components/TitleBodyActionsNotificationCard";

type SubscriptionState = "unset" | "requested" | "subscribed" | "unsubscribed" | "denied";

function getSubscriptionState(): SubscriptionState {
  if (!("Notification" in window)) return "denied";
  const permission = Notification.permission;
  if (permission === "denied") return "denied";
  if (permission === "default") return "unset";
  // permission is "granted" — check soft subscription
  const softState = localStorage.getItem("notification-subscribed");
  if (softState === "false") return "unsubscribed";
  return "subscribed";
}

const badgeConfig: Record<SubscriptionState, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  subscribed: { variant: "default", label: "Subscribed" },
  unsubscribed: { variant: "secondary", label: "Unsubscribed" },
  denied: { variant: "destructive", label: "Denied" },
  unset: { variant: "secondary", label: "Not Set" },
  requested: { variant: "secondary", label: "Requested" },
};

export function HomePage() {
  const [state, setState] = useState<SubscriptionState>(getSubscriptionState);
  const [copied, setCopied] = useState(false);

  // Listen for permission changes (e.g. user resets via browser settings)
  useEffect(() => {
    if (!("permissions" in navigator)) return;

    navigator.permissions.query({ name: "notifications" }).then((perm) => {
      perm.onchange = () => setState(getSubscriptionState());
    });
  }, []);

  const handleSubscribe = async () => {
    setState("requested");
    const result = await Notification.requestPermission();
    if (result === "granted") {
      localStorage.setItem("notification-subscribed", "true");
      setState("subscribed");
    } else if (result === "denied") {
      localStorage.removeItem("notification-subscribed");
      setState("denied");
    }
  };

  const handleCopySettingsUrl = () => {
    navigator.clipboard.writeText("chrome://settings/content/notifications");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { variant, label } = badgeConfig[state];

  return (
    <div className="h-svh flex items-stretch justify-center overflow-hidden bg-[radial-gradient(circle,_var(--grid-dot)_1px,_transparent_1px)] bg-[length:16px_16px]">
      <div className="w-full max-w-[512px] bg-surface border-x border-surface-border relative">
        {/* Theme toggle — top-right, above blur overlays */}
        <div className="absolute top-3 right-3 z-20">
          <ThemeToggle />
        </div>
        <div className="absolute top-0 left-0 right-0 h-[100px] z-10 pointer-events-none backdrop-blur-xl bg-[linear-gradient(to_bottom,_var(--surface)_0%,_transparent_100%)] [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[100px] z-10 pointer-events-none backdrop-blur-xl bg-[linear-gradient(to_top,_var(--surface)_0%,_transparent_100%)] [mask-image:linear-gradient(to_top,_black_0%,_transparent_100%)]" />
        <div className="overflow-y-auto no-scrollbar h-full px-16 pt-[100px] pb-[400px] flex flex-col gap-[100px]">
        <div className="w-full flex flex-col gap-3">
          <div className="p-4 animate-fade-in-up animate-delay-0">
            <h2 className="text-[36px] leading-none font-black tracking-tight w-full text-center text-heading-accent border-0" style={{ fontFamily: "'Fraunces', serif" }}>Permissions</h2>
          </div>
        <div className="animate-fade-in-up animate-delay-1">
        <DynamicShadowCard className="w-full">
          <CardHeader>
          <CardTitle>Notification Permissions</CardTitle>
          <CardDescription>
            Manage browser notification permissions for this site
          </CardDescription>
          <CardAction>
            <Badge variant={variant} className="transition-all duration-500">{label}</Badge>
          </CardAction>
        </CardHeader>
        <div className={`section-collapse ${state !== "unset" ? "is-open" : ""}`}>
          <div className="px-6 pb-0">
            <button
              onClick={handleCopySettingsUrl}
              className="w-full text-left px-3 py-2 rounded-md bg-muted text-xs font-mono text-foreground hover:bg-muted/80 transition-colors cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="truncate">chrome://settings/content/notifications</span>
              <span className="text-muted-foreground shrink-0">
                {copied ? "✓ Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>
        <div className={`section-collapse ${state === "unset" ? "is-open" : ""}`}>
          <div className="flex items-center px-6">
            <Button
              className="w-full"
              onClick={handleSubscribe}
            >
              Request Permission
            </Button>
          </div>
        </div>
        </DynamicShadowCard>
        </div>
        </div>
        {state === "subscribed" && (
        <div className="w-full flex flex-col gap-3">
          <div className="p-4 animate-fade-in-up animate-delay-2">
            <h2 className="text-[36px] leading-none font-black tracking-tight w-full text-center text-heading-accent border-0" style={{ fontFamily: "'Fraunces', serif" }}>Notifications</h2>
          </div>
          <div className="flex flex-col gap-16">
          <div className="animate-fade-in-up animate-delay-3">
            <TitleOnlyNotificationCard />
          </div>
          <div className="animate-fade-in-up animate-delay-4">
            <TitleDescriptionNotificationCard />
          </div>
          <div className="animate-fade-in-up animate-delay-5">
            <TitleBodyImageNotificationCard />
          </div>
          <div className="animate-fade-in-up animate-delay-6">
            <TitleBodyActionsNotificationCard />
          </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
}
