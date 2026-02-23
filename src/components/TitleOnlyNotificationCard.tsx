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

const titles = [
  "Hello!",
  "Hi there!",
  "Hey!",
  "What's up!",
  "Howdy!",
];

function randomTitle() {
  return titles[Math.floor(Math.random() * titles.length)];
}

export function TitleOnlyNotificationCard() {
  const [sent, setSent] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleSendNotification = () => {
    if (Notification.permission !== "granted") return;

    // Title-only notification: no body, no options — macOS renders
    // just the title line alongside the browser icon per Apple HIG.
    new Notification(randomTitle());

    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const isGranted = "Notification" in window && Notification.permission === "granted";

  return (
    <DynamicShadowCard className="w-full">
      <CardHeader className="grid-rows-[auto] gap-0 text-center">
        <CardTitle>Title Only</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={`${import.meta.env.BASE_URL}creatives/title-only-${resolvedTheme === "dark" ? "dark" : "light"}.png`}
          alt="Title only notification preview"
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
