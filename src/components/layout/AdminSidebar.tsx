"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  PersonIcon,
  BoxModelIcon,
  ReaderIcon,
  DownloadIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";

const navGroups = [
  {
    header: "CORE",
    items: [
      { label: "Overview", href: "/admin", icon: DashboardIcon },
    ],
  },
  {
    header: "DIRECTORY",
    items: [
      { label: "Users", href: "/admin/users", icon: PersonIcon },
      { label: "Organizations", href: "/admin/organizations", icon: BoxModelIcon },
    ],
  },
  {
    header: "MONITORING",
    items: [
      { label: "Audit", href: "/admin/audit", icon: ReaderIcon },
      { label: "Exports", href: "/admin/exports", icon: DownloadIcon },
    ],
  },
  {
    header: "SYSTEM",
    items: [
      { label: "Settings", href: "/admin/settings", icon: MixerHorizontalIcon },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-zinc-950 border-r border-white/10 relative z-50">
      {/* Top Section */}
      <div
        className="h-16 shrink-0 flex items-stretch border-b border-white/10 relative"
      >
        {/* Logo Pane */}
        <div className="w-16 h-full shrink-0 flex items-center justify-center border-r border-white/10">
          <Image 
            src="/bodega-logo.svg" 
            alt="Bodega" 
            width={24} 
            height={24} 
            className="w-6 h-6"
            priority
          />
        </div>

        {/* Admin Badge */}
        <div className="flex-1 flex items-center px-4 bg-zinc-950">
          <span className="text-[12px] font-mono font-bold tracking-[0.1em] text-zinc-300 uppercase truncate pt-[1px]">
            Platform Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-5 overflow-y-auto w-full">
        {navGroups.map((group) => (
          <div key={group.header} className="space-y-1">
            <h3 className="px-6 text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em] mb-2">
              {group.header}
            </h3>
            {group.items.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 pl-[21px] pr-6 py-2.5 rounded-none text-[12px] font-mono uppercase tracking-wide transition-none group ${
                    isActive
                      ? "border-l-[3px] border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-l-[3px] border-transparent text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"}`}
                  />
                  <span className={isActive ? "font-bold tracking-tight" : ""}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
