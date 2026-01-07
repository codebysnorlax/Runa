import React, { useEffect } from "react";

const toastStyles = `
  @keyframes progressBar {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  @keyframes toast-slide {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @media (max-width: 640px) {
    .toast-container {
      width: 70% !important;
      max-width: 280px !important;
    }
    .toast-container > div {
      padding: 8px 12px !important;
    }
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("toast-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "toast-styles";
  styleSheet.textContent = toastStyles;
  document.head.appendChild(styleSheet);
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    
    // Play audio based on toast type - only once per toast
    let audioRef: HTMLAudioElement | null = null;
    
    if (type === 'success' || type === 'error') {
      audioRef = new Audio(
        type === 'success' 
          ? '/Runa/audio/success.wav' 
          : '/Runa/audio/error.wav'
      );
      audioRef.play().catch(() => {}); // Ignore audio play errors
    }
    
    return () => {
      clearTimeout(timer);
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
        audioRef = null;
      }
    };
  }, [onClose, type]);

  const configs = {
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
  };

  const config = configs[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "2%",
        right: "2%",
        left: "auto",
        zIndex: 1000,
        width: "85%",
        maxWidth: "400px",
        animation: "toast-slide 0.3s ease-out",
      }}
      className="toast-container"
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
          borderRadius: "6px",
          boxShadow: "rgba(111, 111, 111, 0.2) 0px 8px 24px",
          backgroundColor: config.bg,
          backgroundImage: `linear-gradient(0deg, transparent 23%, ${config.grid} 24%, ${config.grid} 25%, transparent 26%, transparent 73%, ${config.grid} 74%, ${config.grid} 75%, transparent 76%, transparent), linear-gradient(90deg, transparent 23%, ${config.grid} 24%, ${config.grid} 25%, transparent 26%, transparent 73%, ${config.grid} 74%, ${config.grid} 75%, transparent 76%, transparent)`,
          backgroundSize: "55px 55px",
          color: config.color,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <svg
            style={{ width: "1em", height: "1em", color: config.color }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={config.icon}
            />
          </svg>
          <div
            style={{
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
              userSelect: "none",
            }}
          >
            {message}
          </div>
        </div>
        <div
          onClick={onClose}
          style={{
            padding: "2px",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            style={{ width: "1em", height: "1em", color: config.color }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "1px",
            backgroundColor: config.color,
            width: "100%",
            transform: "translateX(100%)",
            animation: "progressBar 5s linear forwards",
          }}
        />
      </div>
    </div>
  );
};

export default Toast;
