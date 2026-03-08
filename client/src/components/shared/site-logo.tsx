import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <span className="relative inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-md shadow-cyan-900/20">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 3h8l4 4v14H7z" />
          <path d="M15 3v5h5" />
          <path d="M10 12h6M10 16h6" />
        </svg>
      </span>
      <span className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-slate-700">
        ClausePilot
      </span>
    </Link>
  );
}
