import type { ReactNode } from "react";

export type ButtonProps = {
  text?: string;
  className?: string;
  children?: ReactNode | ReactNode[];

  type?: "button" | "submit" | "reset";
  color?: "primary" | "red" | "white" | "black";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({ text, className, children, type, color, onClick, disabled }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "bg-blue-500 hover:bg-blue-400 shadow-blue-300 disabled:bg-blue-300 text-white"
  } else if (color === "red") {
    colorClass = "bg-red-500 hover:bg-red-400 shadow-red-300 disabled:bg-red-300 text-white"
  } else if (color === "black") {
    colorClass = "bg-neutral-900 hover:bg-neutral-800 shadow-neutral-300 disabled:bg-neutral-500 text-white";
  } else {
    colorClass = "bg-white hover:bg-gray-50 border";
  }

  return (
    <button
      type={type || "button"}
      className={`inline-block px-4 py-2 rounded-xl shadow-lg transition whitespace-nowrap ${colorClass} ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? text}
    </button>
  );
}
