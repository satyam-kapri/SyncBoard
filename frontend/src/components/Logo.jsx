import React from "react";

export function Logo({ size = "medium" }) {
  const fontSize = size === "small" ? "20px" : size === "large" ? "30px" : "24px";

  return (
    <div
      style={{
        fontFamily: "'Londrina Solid', 'Inter', sans-serif",
        fontSize: fontSize,
        fontWeight: "bold",
        userSelect: "none",
        letterSpacing: "0.3px",
        color: "#1e293b",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span style={{ color: "rgba(134, 6, 212, 1)" }}>sync</span>Board
    </div>
  );
}

export default Logo;
