"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  MapPin,
  Boxes,
  Settings,
  ChevronDown,
  Building2,
  Check
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { switchOrg } from "@/lib/actions/org";
import { MembershipRole } from "@prisma/client";

interface Org {
  id: string;
  name: string;
  slug: string | null;
  role: MembershipRole;
}

interface AppSidebarProps {
  activeOrg: Org;
  userOrgs: Org[];
}

const navGroups = [
  {
    header: "CORE",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    header: "INVENTORY",
    items: [
      { label: "Items", href: "/items", icon: Boxes },
      { label: "Stock", href: "/inventory", icon: Package },
      { label: "Movements", href: "/movements", icon: ArrowLeftRight },
      { label: "Locations", href: "/locations", icon: MapPin },
    ]
  },
  {
    header: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export default function AppSidebar({ activeOrg, userOrgs }: AppSidebarProps) {
  const pathname = usePathname();
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { update } = useSession();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOrgSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSwitch(orgId: string) {
    if (orgId === activeOrg.id) {
      setIsOrgSwitcherOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      const result = await switchOrg(orgId);
      if (result.success) {
        await update({ activeOrgId: orgId });
        router.refresh();
      } else {
        console.error("Failed to switch org:", result.error);
      }
    } catch (error) {
      console.error("Error switching org:", error);
    } finally {
      setIsSwitching(false);
      setIsOrgSwitcherOpen(false);
    }
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-zinc-950 border-r border-white/5 relative z-50">
      {/* Top Section / Org Switcher */}
      <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/5 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOrgSwitcherOpen(!isOrgSwitcherOpen)}
          disabled={isSwitching}
          className="flex-1 flex items-center gap-3 w-full rounded-md p-1.5 -ml-1.5 hover:bg-white/5 transition-colors group text-left"
        >
          {/* Logo Icon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 border border-white/10 shrink-0">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
              <path d="M12 12L12 21" />
              <path d="M12 12L20 7.5" />
              <path d="M12 12L4 7.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white truncate leading-tight">
                {activeOrg.name}
              </p>
              <p className="text-[11px] text-zinc-500 font-medium">
                Bodega
              </p>
            </div>
            {userOrgs.length > 1 && (
              <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
          </div>
        </button>

        {/* Org Switcher Dropdown */}
        {isOrgSwitcherOpen && userOrgs.length > 1 && (
          <div className="absolute top-full left-4 right-4 mt-2 rounded-lg bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden z-50 py-1">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Switch Organization</p>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {userOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitch(org.id)}
                  disabled={isSwitching}
                  className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                    org.id === activeOrg.id
                      ? "bg-white/10 text-white"
                      : "hover:bg-white/5 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-4 h-4 shrink-0 opacity-50" />
                    <span className="text-[13px] font-medium truncate">{org.name}</span>
                  </div>
                  {org.id === activeOrg.id && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.header} className="space-y-1">
            <h3 className="px-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
              {group.header}
            </h3>
            {group.items.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/80 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-500"}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      {/* Bottom User Area if needed, or leave clean */}
    </aside>
  );
}
