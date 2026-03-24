"use client";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

const ChitIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Manage Chit logo"
  >
    <circle cx="80" cy="80" r="72" stroke="#1D9E75" strokeWidth="5" strokeDasharray="390 60" strokeLinecap="round" strokeDashoffset="-15" />
    <path d="M136 34 L144 26 L148 38" stroke="#1D9E75" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="46" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3" />
    <circle cx="46" cy="53" r="5" fill="#0F6E56" />
    <path d="M34 72 Q46 67 58 72" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="80" cy="50" r="18" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3.5" />
    <circle cx="80" cy="44" r="6" fill="#0F6E56" />
    <path d="M66 65 Q80 59 94 65" stroke="#0F6E56" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="114" cy="58" r="15" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3" />
    <circle cx="114" cy="53" r="5" fill="#0F6E56" />
    <path d="M102 72 Q114 67 126 72" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="34" y="75" width="92" height="5" rx="2.5" fill="#9FE1CB" />
    <circle cx="80" cy="112" r="26" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="3.5" />
    <circle cx="80" cy="112" r="20" fill="none" stroke="#9FE1CB" strokeWidth="1.5" />
    <text x="80" y="121" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="700" fill="#085041">₹</text>
  </svg>
);

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ChitIcon size={30} />
          <span className="font-semibold text-sm sm:text-base tracking-tight">Manage Chit</span>
        </Link>
        <AuthButton />
      </div>
    </nav>
  );
};
