import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicShadowCard } from "@/components/DynamicShadowCard";

export function TitleDescriptionNotificationCard() {
  const [sent, setSent] = useState(false);

  const handleSendNotification = () => {
    if (Notification.permission !== "granted") return;

    new Notification("Hello from Notifications Browser", {
      body: "This is a notification with a title and a description body.",
    });

    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const isGranted = "Notification" in window && Notification.permission === "granted";

  return (
    <DynamicShadowCard className="w-full">
      <CardHeader className="grid-rows-[auto] gap-0">
        <CardTitle>Title + Description</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[100px] rounded-lg bg-muted" />
      </CardContent>
      <CardFooter>
        <Button
          variant="secondary"
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
