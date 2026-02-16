import { useRef, type ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { useDynamicShadow } from "@/hooks/useDynamicShadow";

/**
 * A Card whose box-shadow and 3-D tilt dynamically follow the cursor,
 * treating the mouse pointer as a light source.
 */
export function DynamicShadowCard({
  style,
  ...props
}: ComponentProps<typeof Card>) {
  const ref = useRef<HTMLDivElement>(null);
  const { shadow, tiltX, tiltY, lightAngle } = useDynamicShadow(ref);

  // Border gradient: white toward pointer → current grey on far side
  const BORDER_GREY = "oklch(0.922 0 0)";
  const borderGradient = `linear-gradient(${lightAngle.toFixed(1)}deg, ${BORDER_GREY}, white)`;

  return (
    <Card
      ref={ref}
      style={{
        ...style,
        boxShadow: shadow,
        border: "1px solid transparent",
        backgroundImage: `linear-gradient(white, white), ${borderGradient}`,
        backgroundOrigin: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
        perspective: "800px",
        transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.005, 1.005, 1.005)`,
        transformStyle: "preserve-3d",
        transition:
          "box-shadow 0.15s ease-out, transform 0.15s ease-out, background-image 0.15s ease-out",
      }}
      {...props}
    />
  );
}
