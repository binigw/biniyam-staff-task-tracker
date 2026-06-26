interface BrandLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ collapsed = false, size = "md" }: BrandLogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 52 };
  const iconSize = iconSizes[size];

  const Icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="10" fill="#1a2744" />
      <path
        d="M13 10h12.5c3.5 0 6 1.2 7.3 3.2 1 1.5 1.2 3.2.8 4.8-.4 1.5-1.3 2.7-2.6 3.4v.1c1.8.6 3.2 1.8 3.9 3.5.6 1.5.6 3.3-.2 5C33.3 33 30.5 35 26.5 35H13V10z"
        fill="#2a3f6f"
      />
      <path
        d="M17 14h8c1.8 0 3 .7 3.5 1.8.4.8.3 1.8-.2 2.6-.6 1-1.7 1.6-3.3 1.6H17V14z"
        fill="#4a90d9"
      />
      <path
        d="M17 24h9c2 0 3.3.8 3.8 2 .4.9.3 2-.3 2.9-.7 1.1-2 1.7-3.5 1.7H17V24z"
        fill="#4a90d9"
      />
      <path d="M30 36L38 24l-4-2-6 10z" fill="#60aaff" opacity="0.85" />
      <path d="M34 14l-8 14 4 2 8-14z" fill="#60aaff" opacity="0.5" />
    </svg>
  );

  if (collapsed) return Icon;

  if (size === "lg") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {Icon}
        <div style={{ lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#4a90d9",
              textTransform: "uppercase",
            }}
          >
            BINIYAM
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
            className="text-foreground"
          >
            STAFF TRACKER
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "md" ? 10 : 8 }}>
      {Icon}
      <div style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#4a90d9",
            textTransform: "uppercase",
          }}
        >
          BINIYAM
        </div>
        <div
          style={{
            fontSize: size === "md" ? 12 : 10,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
          className="text-foreground"
        >
          STAFF TRACKER
        </div>
      </div>
    </div>
  );
}
