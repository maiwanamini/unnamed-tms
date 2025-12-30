"use client";

import PersonIcon from "@mui/icons-material/Person";
import { getInitials, pickAvatarColor } from "@/lib/avatar";

export default function AvatarCircle({
  src,
  name,
  seed,
  size = 44,
  alt = "",
  style,
  className,
}) {
  const initials = getInitials(name);
  const bg = pickAvatarColor(seed || name || src || "");

  // Scale initials with avatar size (small avatars like 22px need smaller text).
  let fontSize = Math.round(size * 0.34);
  if (String(initials || "").length >= 2) fontSize = Math.round(fontSize * 0.9);
  fontSize = Math.max(8, fontSize);
  const iconSize = Math.max(16, Math.round(size * 0.55));

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: bg,
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        userSelect: "none",
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : initials ? (
        <span style={{ fontWeight: 700, fontSize, lineHeight: 1, display: "inline-block" }}>{initials}</span>
      ) : (
        <PersonIcon style={{ fontSize: iconSize, color: "#ffffff" }} />
      )}
    </span>
  );
}
