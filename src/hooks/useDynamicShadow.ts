import { useCallback, useRef } from "react";

// ── Shadow constants ──
const SHADOW_OFFSET = 20; // max px offset
const BLUR_REST = 30;
const BLUR_HOVER = 50;
const SPREAD = -8;
const OPACITY_REST = 0.18;
const OPACITY_HOVER = 0.35;

// ── Tilt constants ──
const MAX_TILT = 12; // degrees – max rotation at card edge
const SCALE_AMOUNT = 0.03; // scale3d(1.03, 1.03, 1.03) at full intensity

// ── Shine ──
const SHINE_STRENGTH = 0.12;

// ── Border ──
const BORDER_OPACITY_REST = 0.15; // 15% when flat
const BORDER_OPACITY_HOVER = 0.5; // 50% when fully 3D

// ── Theme-aware CSS variable helpers ──
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Ramp (smooth entry / exit) ──
const RAMP_IN_DURATION = 300; // ms
const RAMP_OUT_DURATION = 400; // ms – slightly longer for a gentle settle

/**
 * Refs to the three DOM layers that this hook mutates directly.
 * Direct DOM mutation avoids React re-renders on every mousemove,
 * giving instant, lag-free tracking.
 */
export interface CardLayerRefs {
  /** The middle div that receives rotateX / rotateY transforms. */
  container: React.RefObject<HTMLDivElement | null>;
  /** The absolutely-positioned shadow div behind the card. */
  shadow: React.RefObject<HTMLDivElement | null>;
  /** The absolutely-positioned shine overlay on top of the card. */
  shine: React.RefObject<HTMLDivElement | null>;
  /** The border-gradient wrapper around the Card. */
  border: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook that returns mouse event handlers for a 3-D card swivel effect.
 *
 * The card tilts toward the cursor proportional to where on the card
 * the cursor sits (center = no tilt, edge = max tilt). All DOM updates
 * are performed via refs — zero React re-renders during mousemove.
 *
 * On hover entry, an intensity multiplier ramps 0→1 over ~300ms
 * using a cubic ease-out curve. On hover exit, it ramps back 1→0
 * over ~400ms. Direction tracks the cursor every frame; only
 * magnitude eases. This eliminates visual jerks on both entry and exit.
 *
 * Fully JS-driven — no CSS transitions needed.
 */
export function useDynamicShadow(refs: CardLayerRefs) {
  const rafId = useRef(0);

  // ── Ramp state ──
  const rampRafId = useRef(0);
  const rampStartTime = useRef(0);
  const rampFrom = useRef(0);     // intensity value at ramp start
  const rampTo = useRef(1);       // target intensity
  const rampDuration = useRef(RAMP_IN_DURATION);
  const intensity = useRef(0);
  const lastOffsetX = useRef(0);
  const lastOffsetY = useRef(0);

  /** Cubic ease-out: fast start, smooth settle. */
  const easeOut = (t: number) => {
    const inv = 1 - t;
    return 1 - inv * inv * inv;
  };

  /**
   * Apply all visual styles to the DOM layers.
   * Every value is scaled by `k` (intensity, 0–1).
   */
  const applyStyles = useCallback(
    (offsetX: number, offsetY: number, k: number) => {
      const { container, shadow, shine, border } = refs;

      // ── Tilt ──
      if (container.current) {
        const tiltY = offsetX * MAX_TILT * k;
        const tiltX = -(offsetY * MAX_TILT) * k;
        const s = 1 + SCALE_AMOUNT * k;
        container.current.style.transform =
          `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${s.toFixed(4)}, ${s.toFixed(4)}, ${s.toFixed(4)})`;
      }

      // ── Read theme-aware color channels from CSS variables ──
      const shadowOklch = getCSSVar("--card-shadow-oklch") || "0.282 0.091 267.935";
      const shineRgb = getCSSVar("--card-shine-rgb") || "255 255 255";
      const highlightRgb = getCSSVar("--card-border-highlight-rgb") || "255 255 255";
      const borderOklch = getCSSVar("--surface-border-oklch") || "0.922 0 0";

      // ── Shadow (falls opposite to tilt direction) ──
      if (shadow.current) {
        const ox = -offsetX * SHADOW_OFFSET * k;
        const oy = -offsetY * SHADOW_OFFSET * k;
        const blur = BLUR_REST + (BLUR_HOVER - BLUR_REST) * k;
        const opacity = OPACITY_REST + (OPACITY_HOVER - OPACITY_REST) * k;
        shadow.current.style.boxShadow =
          `${ox.toFixed(1)}px ${oy.toFixed(1)}px ${blur.toFixed(0)}px ${SPREAD}px oklch(${shadowOklch} / ${opacity.toFixed(3)})`;
      }

      // ── Shine (light gradient follows cursor) ──
      if (shine.current) {
        const angle = Math.atan2(offsetY, offsetX) * (180 / Math.PI) - 90;
        const edgeDist = Math.sqrt(offsetX * offsetX + offsetY * offsetY) * 2;
        const strength = Math.min(edgeDist, 1) * SHINE_STRENGTH * k;
        shine.current.style.background =
          `linear-gradient(${angle.toFixed(1)}deg, rgb(${shineRgb} / ${strength.toFixed(3)}) 0%, rgb(${shineRgb} / 0) 80%)`;
      }

      // ── Border gradient (highlight toward cursor, opacity ramps with intensity) ──
      if (border.current) {
        const borderAngle =
          (Math.atan2(offsetY, -offsetX) * (180 / Math.PI) + 450) % 360;
        const borderOpacity =
          BORDER_OPACITY_REST + (BORDER_OPACITY_HOVER - BORDER_OPACITY_REST) * k;
        const borderGrey = `oklch(${borderOklch} / ${borderOpacity.toFixed(3)})`;
        const highlightWithOpacity = `rgb(${highlightRgb} / ${(k * borderOpacity).toFixed(3)})`;
        border.current.style.background =
          `linear-gradient(${borderAngle.toFixed(1)}deg, ${highlightWithOpacity}, ${borderGrey})`;
      }
    },
    [refs],
  );

  /**
   * Generic rAF loop that ramps intensity from `rampFrom` to `rampTo`
   * over `rampDuration` ms with cubic ease-out.
   */
  const rampLoop = useCallback(
    (now: number) => {
      const elapsed = now - rampStartTime.current;
      const t = Math.min(elapsed / rampDuration.current, 1);
      const eased = easeOut(t);

      // Lerp from starting intensity to target
      intensity.current =
        rampFrom.current + (rampTo.current - rampFrom.current) * eased;

      applyStyles(lastOffsetX.current, lastOffsetY.current, intensity.current);

      if (t < 1) {
        rampRafId.current = requestAnimationFrame(rampLoop);
      }
    },
    [applyStyles],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const container = refs.container.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();

        // Normalized position: -0.5 (left/top edge) to +0.5 (right/bottom edge)
        const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (e.clientY - rect.top) / rect.height - 0.5;

        // Store latest position for the ramp loop
        lastOffsetX.current = offsetX;
        lastOffsetY.current = offsetY;

        // Apply with current intensity (ramping or fully 1)
        applyStyles(offsetX, offsetY, intensity.current);
      });
    },
    [refs, applyStyles],
  );

  /** Start a ramp animation from current intensity toward a target. */
  const startRamp = useCallback(
    (target: number, duration: number) => {
      cancelAnimationFrame(rampRafId.current);
      rampFrom.current = intensity.current;
      rampTo.current = target;
      rampDuration.current = duration;
      rampStartTime.current = performance.now();
      rampRafId.current = requestAnimationFrame(rampLoop);
    },
    [rampLoop],
  );

  const onMouseEnter = useCallback(() => {
    // Ramp intensity up (from wherever it currently is → 1)
    startRamp(1, RAMP_IN_DURATION);
  }, [startRamp]);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafId.current);

    // Ramp intensity down (from wherever it currently is → 0)
    startRamp(0, RAMP_OUT_DURATION);
  }, [startRamp]);

  return { onMouseMove, onMouseEnter, onMouseLeave };
}
