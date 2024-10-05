import { ReactNode } from "react";

type SubButtonProps = {
  onClick?: () => void;
  children: ReactNode | ReactNode[];
};

export default function SubButton({ onClick, children }: SubButtonProps) {
  return (
    <div
      className="flex items-center px-4 py-2 gap-x-1 bg-neutral-200 hover:opacity-75 rounded-lg cursor-pointer transition"
      onClick={onClick}
    >
      {children}
    </div>
  )
}
