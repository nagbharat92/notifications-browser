import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicShadowCard } from "@/components/DynamicShadowCard";

export function TitleBodyImageNotificationCard() {
  const [sent, setSent] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleSendNotification = () => {
    if (Notification.permission !== "granted") return;

    new Notification("Hello from Notifications Browser", {
      body: "This is a notification with a title, body, and icon.",
      icon: "https://placehold.co/128x128/e2e8f0/64748b?text=Icon",
    });

    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const isGranted = "Notification" in window && Notification.permission === "granted";

  return (
    <DynamicShadowCard className="w-full">
      <CardHeader className="grid-rows-[auto] gap-0">
        <CardTitle>Title + Body + Icon</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={`${import.meta.env.BASE_URL}creatives/icon-${resolvedTheme === "dark" ? "dark" : "light"}.png`}
          alt="Title + body + icon notification preview"
          className="w-full rounded-lg object-cover"
        />
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          disabled={!isGranted}
          onClick={handleSendNotification}
        >
          {sent ? "✓ Sent" : isGranted ? "Send Notification" : "Permission Required"}
        </Button>
      </CardFooter>
    </DynamicShadowCard>
  );
}
