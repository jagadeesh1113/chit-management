"use client";

export function CheckIcon() {
  return (
    <>
      <style>{`
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes draw-circle {
          from { stroke-dashoffset: 150.8; opacity: 0; }
          to   { stroke-dashoffset: 0;     opacity: 1; }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        .check-wrapper {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .check-circle {
          animation: draw-circle 0.5s ease-out forwards;
        }
        .check-path {
          animation: draw-check 0.35s ease-out 0.4s forwards;
        }
      `}</style>
      <div className="check-wrapper relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
        <svg
          className="w-10 h-10 text-primary"
          viewBox="0 0 52 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="check-circle"
            cx="26"
            cy="26"
            r="24"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="150.8"
            strokeDashoffset="150.8"
          />
          <path
            className="check-path"
            d="M14 26l9 9 15-17"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="40"
          />
        </svg>
      </div>
    </>
  );
}
