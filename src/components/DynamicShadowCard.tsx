import { useRef, type ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { useDynamicShadow } from "@/hooks/useDynamicShadow";

/**
 * A Card whose box-shadow dynamically follows the cursor,
 * treating the mouse pointer as a light source.
 */
export function DynamicShadowCard({
  style,
  ...props
}: ComponentProps<typeof Card>) {
  const ref = useRef<HTMLDivElement>(null);
  const shadow = useDynamicShadow(ref);

  return (
    <Card
      ref={ref}
      style={{ ...style, boxShadow: shadow, transition: "box-shadow 0.15s ease-out" }}
      {...props}
    />
  );
}
