"use client";

export default function Card({ children, className = "card", style = {} }) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
