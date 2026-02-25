import React, { useEffect, useRef, useState } from "react";
import { useToast, ToastItem } from "../context/ToastContext";

/* ─── Styles injected once ─── */
const toastStyles = `
  @keyframes toast-progress {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  @keyframes toast-enter {
    0% { transform: translateX(120%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes toast-exit {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(120%); opacity: 0; }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-styles-v2")
) {
  const el = document.createElement("style");
  el.id = "toast-styles-v2";
  el.textContent = toastStyles;
  document.head.appendChild(el);

  // Clean up old style tag if present
  const old = document.getElementById("toast-styles");
  if (old) old.remove();
}

/* ─── Color configs ─── */
const CONFIGS = {
  success: {
    color: "#047857",
    bg: "#7dffbc",
    grid: "rgba(16, 185, 129, 0.25)",
    icon: "M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  error: {
    color: "#7f1d1d",
    bg: "#ff7e7e",
    grid: "rgba(239, 68, 68, 0.25)",
    icon: "m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  info: {
    color: "#1e3a8a",
    bg: "#7eb8ff",
    grid: "rgba(59, 131, 246, 0.25)",
    icon: "M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  warning: {
    color: "#78350f",
    bg: "#ffe57e",
    grid: "rgba(245, 159, 11, 0.25)",
    icon: "M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
} as const;

/* ─── Single toast card ─── */
interface ToastCardProps {
  item: ToastItem;
  onClose: () => void;
  isExiting: boolean;
}

const ToastCard: React.FC<ToastCardProps> = ({ item, onClose, isExiting }) => {
  const hasPlayedAudio = useRef(false);

  useEffect(() => {
    if (
      !hasPlayedAudio.current &&
      (item.type === "success" || item.type === "error")
    ) {
      const audio = new Audio(
        item.type === "success"
          ? `${import.meta.env.BASE_URL}audio/success.wav`
          : `${import.meta.env.BASE_URL}audio/error.wav`
      );
      audio.play().catch(() => { });
      hasPlayedAudio.current = true;
    }
  }, [item.type]);

  const cfg = CONFIGS[item.type];

  return (
    <div
      style={{
        animation: isExiting
          ? "toast-exit 0.35s ease-in forwards"
          : "toast-enter 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1em",
          overflow: "hidden",
          padding: "10px 15px",
          borderRadius: "10px",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)",
          backgroundColor: cfg.bg,
          backgroundImage: `linear-gradient(0deg, transparent 23%, ${cfg.grid} 24%, ${cfg.grid} 25%, transparent 26%, transparent 73%, ${cfg.grid} 74%, ${cfg.grid} 75%, transparent 76%, transparent), linear-gradient(90deg, transparent 23%, ${cfg.grid} 24%, ${cfg.grid} 25%, transparent 26%, transparent 73%, ${cfg.grid} 74%, ${cfg.grid} 75%, transparent 76%, transparent)`,
          backgroundSize: "55px 55px",
          color: cfg.color,
          fontFamily: "sans-serif",
        }}
      >
        {/* Icon + Message */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <svg
            style={{
              width: "1.1em",
              height: "1.1em",
              color: cfg.color,
              flexShrink: 0,
            }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={cfg.icon}
            />
          </svg>
          <div
            style={{
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              userSelect: "none",
              fontWeight: 500,
            }}
          >
            {item.message}
          </div>
        </div>

        {/* Close button */}
        <div
          onClick={onClose}
          style={{
            padding: "3px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "background 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = `${cfg.color}15`)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <svg
            style={{ width: "0.9em", height: "0.9em", color: cfg.color }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </div>

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            backgroundColor: cfg.color,
            width: "100%",
            transform: "translateX(100%)",
            animation: "toast-progress 5s linear forwards",
            borderRadius: "0 0 10px 10px",
          }}
        />
      </div>
    </div>
  );
};

/* ─── Toast Container (renders all toasts, manages stacking) ─── */
const TOAST_DURATION = 5000;
const COLLAPSED_GAP = 8; // px offset per stacked toast (collapsed)
const COLLAPSED_SCALE_STEP = 0.04; // scale reduction per stack level
const EXPANDED_GAP = 54; // px offset per toast (expanded/hovered)

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [hovered, setHovered] = useState(false);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up auto-dismiss timers
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!timerRefs.current.has(toast.id) && !exitingIds.has(toast.id)) {
        const timer = setTimeout(() => {
          handleDismiss(toast.id);
        }, TOAST_DURATION);
        timerRefs.current.set(toast.id, timer);
      }
    });

    // Clean up timers for removed toasts
    const currentIds = new Set(toasts.map((t) => t.id));
    timerRefs.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        timerRefs.current.delete(id);
      }
    });
  }, [toasts]);

  const handleDismiss = (id: string) => {
    setExitingIds((prev) => new Set(prev).add(id));
    // Wait for exit animation, then truly remove
    setTimeout(() => {
      removeToast(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  };

  const handleMouseEnter = () => {
    // Cancel any pending collapse
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    // Debounce collapse to prevent flickering when cursor crosses gaps
    leaveTimerRef.current = setTimeout(() => {
      setHovered(false);
      leaveTimerRef.current = null;
    }, 150);
  };

  if (toasts.length === 0) return null;

  // Reverse so newest is at top (index 0 = newest)
  const reversed = [...toasts].reverse();
  const isExpanded = hovered;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 9999,
        width: "min(85vw, 400px)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          // Reserve enough height so the expanded stack doesn't clip
          height: isExpanded
            ? `${reversed.length * EXPANDED_GAP + 10}px`
            : `${(reversed.length - 1) * COLLAPSED_GAP + 60}px`,
          transition: "height 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {reversed.map((toast, index) => {
          const isExiting = exitingIds.has(toast.id);

          // Stacking transforms
          const yOffset = isExpanded
            ? index * EXPANDED_GAP
            : index * COLLAPSED_GAP;
          const scale = isExpanded
            ? 1
            : 1 - index * COLLAPSED_SCALE_STEP;
          const opacity = isExpanded
            ? 1
            : index === 0
              ? 1
              : Math.max(0.4, 1 - index * 0.2);

          return (
            <div
              key={toast.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${yOffset}px) scale(${scale})`,
                transformOrigin: "top center",
                opacity,
                zIndex: reversed.length - index,
                transition: isExiting
                  ? "none"
                  : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease",
                pointerEvents: isExiting ? "none" : "auto",
              }}
            >
              <ToastCard
                item={toast}
                onClose={() => handleDismiss(toast.id)}
                isExiting={isExiting}
              />
            </div>
          );
        })}
      </div>

      {/* Toast count badge when collapsed and more than 1 */}
      {!isExpanded && toasts.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: "-6px",
            left: "-6px",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ff6b35, #ff4500)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(255, 69, 0, 0.4)",
            zIndex: 10000,
            pointerEvents: "none",
            fontFamily: "sans-serif",
          }}
        >
          {toasts.length}
        </div>
      )}
    </div>
  );
};

/* ─── Legacy default export for backward compat (individual toast) ─── */
interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const dummyItem: ToastItem = {
    id: "legacy",
    message,
    type,
    createdAt: Date.now(),
  };
  return <ToastCard item={dummyItem} onClose={onClose} isExiting={false} />;
};

export default Toast;
