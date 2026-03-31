"use client";

import { useOrg } from "@/features/shared/OrgContext";
import Link from "next/link";
import { AlertTriangle, Send, RefreshCw, CheckCircle2 } from "lucide-react";
import type { InventoryIndicators } from "@/modules/indicators";

interface InventoryAlertsProps {
  indicators: InventoryIndicators;
}

export function InventoryAlerts({ indicators }: InventoryAlertsProps) {
  const { orgId } = useOrg();

  const hasAlerts =
    indicators.lowStock.length > 0 ||
    indicators.largeOutbound.length > 0 ||
    indicators.frequentAdjustments.length > 0;

  const formatDate = (dateValue: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateValue));
  };

  if (!hasAlerts) {
    return (
      <div className="bg-zinc-900/30 border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] rounded-xl p-12 flex flex-col items-center justify-center text-center backdrop-blur-3xl transition-all">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-1 text-lg">All clear!</h3>
        <p className="text-zinc-500 text-sm">No alerts need your attention.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Low Stock Section */}
      <div className="bg-zinc-900/30 border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] rounded-xl overflow-hidden backdrop-blur-3xl flex flex-col h-full">
        <div className="px-5 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20">
              <div className="absolute w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] top-0 right-0 -mt-0.5 -mr-0.5 animate-pulse" />
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-zinc-300 font-medium text-sm">Low Stock</h3>
          </div>
          {indicators.lowStock.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-mono bg-white/10 rounded text-zinc-300">
              {indicators.lowStock.length}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {indicators.lowStock.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">No low stock items.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {indicators.lowStock.slice(0, 5).map((item) => (
                <li key={item.itemId} className="px-5 py-3 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm text-white truncate font-medium">{item.itemName}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{item.itemSku} • {item.locationName}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono text-rose-400">{item.currentQty}</span>
                    <span className="text-xs text-zinc-500">of {item.threshold}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {indicators.lowStock.length > 5 && (
          <div className="p-3 border-t border-white/5 bg-zinc-900/10 text-center">
            <Link href={`/${orgId}/inventory`} className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              View All Low Stock ({indicators.lowStock.length})
            </Link>
          </div>
        )}
      </div>

      {/* 2. Large Outbound Section */}
      <div className="bg-zinc-900/30 border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] rounded-xl overflow-hidden backdrop-blur-3xl flex flex-col h-full">
        <div className="px-5 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20">
              <div className="absolute w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] top-0 right-0 -mt-0.5 -mr-0.5" />
              <Send className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-zinc-300 font-medium text-sm">Large Outbound</h3>
          </div>
          {indicators.largeOutbound.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-mono bg-white/10 rounded text-zinc-300">
              {indicators.largeOutbound.length}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {indicators.largeOutbound.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">No large outbound movements.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {indicators.largeOutbound.slice(0, 5).map((item) => (
                <li key={item.itemId} className="px-5 py-3 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm text-white truncate font-medium">{item.itemName}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{item.itemSku} • {item.locationName} • {item.percentOfStock}% issued</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono text-amber-400">-{item.issuedQty}</span>
                    <span className="text-xs text-zinc-500">{formatDate(item.issuedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {indicators.largeOutbound.length > 5 && (
          <div className="p-3 border-t border-white/5 bg-zinc-900/10 text-center">
            <Link href={`/${orgId}/inventory`} className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              View All Movements ({indicators.largeOutbound.length})
            </Link>
          </div>
        )}
      </div>

      {/* 3. Frequent Adjustments Section */}
      <div className="bg-zinc-900/30 border border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] rounded-xl overflow-hidden backdrop-blur-3xl flex flex-col h-full">
        <div className="px-5 py-4 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="absolute w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] top-0 right-0 -mt-0.5 -mr-0.5" />
              <RefreshCw className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-zinc-300 font-medium text-sm text-left leading-tight">Frequent<br />Adjustments</h3>
          </div>
          {indicators.frequentAdjustments.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-mono bg-white/10 rounded text-zinc-300">
              {indicators.frequentAdjustments.length}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {indicators.frequentAdjustments.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">No frequent adjustments.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {indicators.frequentAdjustments.slice(0, 5).map((item) => (
                <li key={item.itemId} className="px-5 py-3 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm text-white truncate font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{item.sku}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono text-blue-400">{item.adjustmentCount}x</span>
                    <span className="text-xs text-zinc-500">last {formatDate(item.lastAdjustment)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {indicators.frequentAdjustments.length > 5 && (
          <div className="p-3 border-t border-white/5 bg-zinc-900/10 text-center">
            <Link href={`/${orgId}/inventory`} className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              View All Adjustments ({indicators.frequentAdjustments.length})
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
