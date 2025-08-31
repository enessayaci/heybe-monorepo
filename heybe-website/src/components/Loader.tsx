import { cn } from "@/lib/utils";
import React from "react";

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
  fullScreen?: boolean;
  show: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 20,
  color = "text-blue-600",
  className,
  fullScreen,
  show,
}) => {
  return (
    <div
      className={cn(
        `inset-0 !mt-0 flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none ${
          show ? "z-[501] opacity-100" : "-z-50 opacity-0"
        }`,
        {
          ["fixed z-[10011]"]: fullScreen,
        },
        {
          ["absolute"]: !fullScreen,
        },

        className
      )}
    >
      <svg
        className={cn("animate-spin", color)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={size}
        height={size}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Loader;
