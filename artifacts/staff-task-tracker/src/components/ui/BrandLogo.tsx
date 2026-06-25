interface BrandLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ collapsed = false, size = "md" }: BrandLogoProps) {
  const iconSize = size === "lg" ? 56 : size === "sm" ? 32 : 40;

  const icon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Dark rounded square badge */}
      <rect width="56" height="56" rx="12" fill="#1a2236" />

      {/* Stylized B */}
      <text
        x="8"
        y="42"
        fontSize="38"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        fill="white"
        letterSpacing="-2"
      >
        B
      </text>

      {/* Upward trend / checkmark tracker line overlaid on B */}
      <polyline
        points="10,44 20,30 30,36 44,16"
        stroke="#60a5fa"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow head */}
      <polyline
        points="39,13 44,16 41,21"
        stroke="#60a5fa"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  if (collapsed) return icon;

  return (
    <div className="flex items-center gap-3">
      {icon}
      {size === "lg" ? (
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-black uppercase tracking-widest text-white">
            BINIYAM'S
          </span>
          <span className="text-2xl font-black uppercase tracking-wider text-white">
            STAFF TRACKER
          </span>
          <span className="text-xs text-white/50 tracking-wide mt-0.5">
            Team Task Management
          </span>
        </div>
      ) : (
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-black uppercase tracking-widest text-sidebar-foreground">
            BINIYAM'S
          </span>
          <span className="text-sm font-black uppercase tracking-wider text-sidebar-foreground">
            STAFF TRACKER
          </span>
          <span className="text-[10px] text-sidebar-foreground/50 tracking-wide">
            Team Task Management
          </span>
        </div>
      )}
    </div>
  );
}
