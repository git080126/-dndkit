"use client";

import React from "react";
import { X, GripVertical } from "lucide-react";
import type { ChartOption } from "./types";
import { PanelItem } from "./PanelItem";

// ─── Side Panel ───────────────────────────────────────────────────────────────

interface SidePanelProps {
    options: ChartOption[];
    onClose: () => void;
}

export function SidePanel({ options, onClose }: SidePanelProps) {
    return (
        <>
            <div className="fixed inset-0 z-20" onClick={onClose} />
            <div
                className="fixed top-0 right-0 h-full z-30 bg-white flex flex-col"
                style={{
                    width: 256,
                    boxShadow: "-6px 0 32px rgba(0,0,0,0.12)",
                    animation: "slideIn 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
            >
                <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            Customize
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                            Chart Style
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                    >
                        <X size={14} className="text-slate-500" />
                    </button>
                </div>
                <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                    <GripVertical size={11} className="text-indigo-400" />
                    <p className="text-[10px] text-indigo-500 font-medium">
                        Drag onto any highlighted chart block
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    {options.map((opt) => (
                        <PanelItem key={opt.id} option={opt} />
                    ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <p className="text-[10px] text-slate-400 text-center">
                        Same data · different visualization
                    </p>
                </div>
            </div>
        </>
    );
}
