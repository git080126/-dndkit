"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { ChartOption } from "./types";

// ─── Draggable Panel Item ─────────────────────────────────────────────────────

interface PanelItemProps {
    option: ChartOption;
}

export function PanelItem({ option }: PanelItemProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `panel::${option.id}`,
        data: { chartType: option.id },
    });
    const { Mini } = option;

    return (
        <div
            ref={setNodeRef}
            className="rounded-xl border-2 overflow-hidden"
            style={{
                opacity: isDragging ? 0.3 : 1,
                borderColor: "#e2e8f0",
                background: "#fff",
            }}
        >
            <div
                {...listeners}
                {...attributes}
                className="p-2.5 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">
                        {option.label}
                    </span>
                    <GripVertical size={12} className="text-slate-300" />
                </div>
                <div className="w-full h-10 rounded-lg bg-slate-50 overflow-hidden flex items-center px-1">
                    <Mini />
                </div>
            </div>
            <div className="w-full py-1.5 text-center text-[10px] font-medium border-t border-slate-100 text-slate-400 bg-slate-50">
                Drag onto a chart block
            </div>
        </div>
    );
}
