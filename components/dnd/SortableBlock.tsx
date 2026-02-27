"use client";

import React, { type CSSProperties, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoveIcon } from "lucide-react";
import { isChartBlock } from "./types";

// ─── Sortable Block Wrapper ───────────────────────────────────────────────────

interface SortableBlockProps {
    /** Block id — used for both sortable and droppable */
    id: string;
    /** Whether this block can receive panel drops (chart blocks only) */
    acceptDrop?: boolean;
    /** Content to render inside the block */
    children: ReactNode;
    /** Optional className for the outer wrapper */
    className?: string;
}

/**
 * Generic sortable wrapper.
 * - Every block gets drag-to-reorder via `useSortable`.
 * - Chart blocks additionally get `useDroppable` for panel chart swaps.
 * - Provides a drag handle (✥ icon) on hover.
 */
export function SortableBlock({
    id,
    acceptDrop,
    children,
    className = "",
}: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    // Only register as droppable if explicitly accepting drops
    const shouldDrop = acceptDrop ?? isChartBlock(id);
    const { setNodeRef: setDropRef } = useDroppable({ id, disabled: !shouldDrop });

    // Merge both refs
    const setRef = (el: HTMLDivElement | null) => {
        setSortRef(el);
        if (shouldDrop) setDropRef(el);
    };

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setRef} style={style} className={`relative group ${className}`}>
            {children}

            {/* Drag handle — visible on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-3 left-3 cursor-grab active:cursor-grabbing p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Drag to reorder"
            >
                <MoveIcon size={14} className="text-slate-400" />
            </div>
        </div>
    );
}
