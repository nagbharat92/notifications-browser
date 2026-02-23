import { useRef, type ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { useDynamicShadow } from "@/hooks/useDynamicShadow";

/**
 * A Card with a true 3-D swivel effect that tracks the cursor.
 *
 * DOM structure (3 layers):
 *   1. Outer div  — sets `perspective` (3-D context for children),
 *                    binds mouse events. Does NOT rotate.
 *   2. Middle div — receives rotateX / rotateY transforms + scale.
 *                    Has `transform-style: preserve-3d`.
 *                    Contains the shadow, border-gradient, shine, and card.
 *   3. Inner      — the <Card> with content.
 *
 * Shadow is a separate absolutely-positioned div so it doesn't
 * rotate with the card surface.
 *
 * All per-frame DOM mutations happen via refs (zero React re-renders
 * during mousemove). Only `isHovering` (boolean) is React state,
 * used to toggle the CSS transition on/off (off while tracking for
 * instant response, on for the smooth reset on mouse-leave).
 */
export function DynamicShadowCard({
  style,
  className,
  ...props
}: ComponentProps<typeof Card>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  const { onMouseMove, onMouseEnter, onMouseLeave } =
    useDynamicShadow({
      container: containerRef,
      shadow: shadowRef,
      shine: shineRef,
      border: borderRef,
    });

  return (
    /* Layer 1: Perspective provider + event target */
    <div
      className="dynamic-shadow-card"
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        perspective: "800px",
      }}
    >
      {/* Layer 2: Rotating container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          transform: "rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
        }}
      >
        {/* Shadow layer — sits behind the card */}
        <div
          ref={shadowRef}
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            right: "5%",
            bottom: "5%",
            borderRadius: "var(--radius-xl)",
            boxShadow:
              "0px 8px 30px -8px oklch(var(--card-shadow-oklch) / 0.18)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Border gradient wrapper */}
        <div
          ref={borderRef}
          style={{
            position: "relative",
            background: "linear-gradient(180deg, var(--surface-border), var(--surface-border))",
            borderRadius: "calc(var(--radius-xl) + 1px)",
            padding: "1px",
            zIndex: 1,
          }}
        >
          {/* Card surface */}
          <Card
            className={className}
            style={{
              ...style,
              position: "relative",
              border: "none",
              backgroundColor: "var(--card-surface)",
            }}
            {...props}
          />

          {/* Shine overlay */}
          <div
            ref={shineRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: "var(--radius-xl)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 80%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
