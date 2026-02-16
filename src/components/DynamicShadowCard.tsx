import { useRef, type ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { useDynamicShadow } from "@/hooks/useDynamicShadow";

/**
 * A Card whose box-shadow and 3-D tilt dynamically follow the cursor,
 * treating the mouse pointer as a light source.
 *
 * Uses a wrapper div for the gradient border instead of multi-layer
 * backgroundImage/backgroundClip (which can lose its background
 * when the browser reclaims GPU compositing layers during scroll).
 */
export function DynamicShadowCard({
  style,
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const ref = useRef<HTMLDivElement>(null);
  const { shadow, tiltX, tiltY, lightAngle } = useDynamicShadow(ref);

  // Border gradient: white toward pointer → current grey on far side
  const BORDER_GREY = "oklch(0.922 0 0)";
  const borderGradient = `linear-gradient(${lightAngle.toFixed(1)}deg, ${BORDER_GREY}, white)`;

  return (
    <div
      ref={ref}
      style={{
        background: borderGradient,
        borderRadius: "calc(var(--radius-xl) + 1px)",
        padding: "1px",
        boxShadow: shadow,
        perspective: "800px",
        transform: `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.005, 1.005, 1.005)`,
        willChange: "transform, box-shadow",
        transition: "box-shadow 0.15s ease-out, transform 0.15s ease-out",
      }}
    >
      <Card
        className={className}
        style={{
          ...style,
          border: "none",
          backgroundColor: "white",
        }}
        {...props}
      />
    </div>
  );
}
