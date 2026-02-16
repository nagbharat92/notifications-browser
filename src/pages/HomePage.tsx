import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicShadowCard } from "@/components/DynamicShadowCard";

type SubscriptionState = "unset" | "subscribed" | "unsubscribed" | "denied";

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
    <div className="h-svh flex items-stretch justify-center overflow-hidden bg-[radial-gradient(circle,_oklch(0.88_0_0)_1px,_transparent_1px)] bg-[length:16px_16px]">
      <div className="w-full max-w-[512px] bg-[oklch(0.985_0_0)] border-x border-[oklch(0.92_0_0)] relative">
        <div className="absolute top-0 left-0 right-0 h-[100px] z-10 pointer-events-none backdrop-blur-xl bg-[linear-gradient(to_bottom,_oklch(0.985_0_0)_0%,_oklch(0.985_0_0_/_0%)_100%)] [mask-image:linear-gradient(to_bottom,_black_0%,_transparent_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[100px] z-10 pointer-events-none backdrop-blur-xl bg-[linear-gradient(to_top,_oklch(0.985_0_0)_0%,_oklch(0.985_0_0_/_0%)_100%)] [mask-image:linear-gradient(to_top,_black_0%,_transparent_100%)]" />
        <div className="overflow-y-auto no-scrollbar h-full px-16 py-[200px] flex flex-col gap-16">
        <div className="w-full flex flex-col gap-3">
          <div className="p-4">
            <h1 className="text-[48px] leading-none font-black tracking-tight w-full text-center text-[oklch(48.8%_0.243_264.376)]" style={{ fontFamily: "'Fraunces', serif" }}>Permissions</h1>
          </div>
        <DynamicShadowCard className="w-full">
          <CardHeader>
          <CardTitle>Notification Permissions</CardTitle>
          <CardDescription>
            Manage browser notification permissions for this site
          </CardDescription>
          <CardAction>
            <Badge variant={variant}>{label}</Badge>
          </CardAction>
        </CardHeader>
        {(state === "subscribed" || state === "unsubscribed" || state === "denied") && (
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">
              To revoke permissions, paste this URL in your address bar:
            </p>
            <button
              onClick={handleCopySettingsUrl}
              className="w-full text-left px-3 py-2 rounded-md bg-muted text-xs font-mono text-foreground hover:bg-muted/80 transition-colors cursor-pointer flex items-center justify-between gap-2"
            >
              <span className="truncate">chrome://settings/content/notifications</span>
              <span className="text-muted-foreground shrink-0">
                {copied ? "✓ Copied" : "Copy"}
              </span>
            </button>
          </CardContent>
        )}
        {state === "unset" && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubscribe}
            >
              Request Permission
            </Button>
          </CardFooter>
        )}
        </DynamicShadowCard>
        </div>
        {Array.from({ length: 10 }, (_, i) => (
          <DynamicShadowCard key={`blank-${i}`} className="w-full min-h-[200px]" />
        ))}
        </div>
      </div>
    </div>
  );
}
