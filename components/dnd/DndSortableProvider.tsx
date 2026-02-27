"use client";

import React, {
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
    rectIntersection,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
    type CollisionDetection,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import type { Block, ChartType, ChartOption } from "./types";
import { isChartBlock, isPanelDrag } from "./types";
import { saveBlocks } from "./persistence";
import { DndStateProvider } from "./DndStateContext";

// ─── DnD Sortable Provider ───────────────────────────────────────────────────

interface DndSortableProviderProps {
    /** Current block list */
    blocks: Block[];
    /** Called when blocks are reordered via drag */
    onBlocksChange: (blocks: Block[]) => void;
    /** Chart options for the panel overlay */
    chartOptions: ChartOption[];
    /** Whether the side panel is open (affects collision detection visuals) */
    isPanelOpen?: boolean;
    /** Optional localStorage key for persistence (pass `null` to disable) */
    persistKey?: string | null;
    /** Minimum drag distance before activation (default: 8px) */
    activationDistance?: number;
    /** Children — typically your grid of SortableBlock components */
    children: ReactNode;
}

/**
 * Drop-in DnD provider that handles:
 * 1. Block reordering (sortable)
 * 2. Panel-to-chart-block swap (draggable → droppable)
 * 3. Custom collision detection per drag type
 * 4. Drag overlay for panel items
 * 5. Optional localStorage persistence
 *
 * Usage:
 * ```tsx
 * <DndSortableProvider blocks={blocks} onBlocksChange={setBlocks} chartOptions={CHART_OPTIONS}>
 *   <div className="grid grid-cols-2 gap-4">
 *     {blocks.map(block => (
 *       <SortableBlock key={block.id} id={block.id}>
 *         <YourContent />
 *       </SortableBlock>
 *     ))}
 *   </div>
 * </DndSortableProvider>
 * ```
 */
export function DndSortableProvider({
    blocks,
    onBlocksChange,
    chartOptions,
    isPanelOpen = false,
    persistKey,
    activationDistance = 8,
    children,
}: DndSortableProviderProps) {
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: activationDistance },
        }),
    );

    // Persist blocks when they change
    useEffect(() => {
        if (persistKey !== null) {
            saveBlocks(blocks, persistKey ?? undefined);
        }
    }, [blocks, persistKey]);

    // ── Custom collision detection ──────────────────────────────────────────
    const customCollision: CollisionDetection = useCallback(
        (args) => {
            const activeId = args.active.id as string;
            if (isPanelDrag(activeId)) {
                // Panel drag → only match chart blocks (strict)
                const chartDroppables = args.droppableContainers.filter((c) =>
                    isChartBlock(c.id),
                );
                return pointerWithin({ ...args, droppableContainers: chartDroppables });
            }
            // Block reorder → generous rect intersection
            return rectIntersection(args);
        },
        [],
    );

    // ── Drag handlers ───────────────────────────────────────────────────────
    const handleDragStart = useCallback((e: DragStartEvent) => {
        setActiveDragId(e.active.id as string);
    }, []);

    const handleDragOver = useCallback((e: DragOverEvent) => {
        const id = e.over?.id as string | undefined;
        setOverId(id && isChartBlock(id) ? id : null);
    }, []);

    const handleDragEnd = useCallback(
        (e: DragEndEvent) => {
            const activeId = e.active.id as string;
            setActiveDragId(null);
            setOverId(null);

            // Panel drag → chart swap
            if (isPanelDrag(activeId)) {
                const targetId = e.over?.id as string | undefined;
                const chartType = e.active.data.current?.chartType as
                    | ChartType
                    | undefined;
                if (!chartType || !targetId || !isChartBlock(targetId)) return;
                onBlocksChange(
                    blocks.map((b) =>
                        b.id === targetId ? { ...b, chartType } : b,
                    ),
                );
                return;
            }

            // Block reorder
            const overBlockId = e.over?.id as string | undefined;
            if (!overBlockId || activeId === overBlockId) return;
            const oldIdx = blocks.findIndex((b) => b.id === activeId);
            const newIdx = blocks.findIndex((b) => b.id === overBlockId);
            onBlocksChange(arrayMove(blocks, oldIdx, newIdx));
        },
        [blocks, onBlocksChange],
    );

    const handleDragCancel = useCallback(() => {
        setActiveDragId(null);
        setOverId(null);
    }, []);

    // ── Drag overlay for panel items ────────────────────────────────────────
    const activePanelOption =
        activeDragId && isPanelDrag(activeDragId)
            ? chartOptions.find((o) => `panel::${o.id}` === activeDragId) ?? null
            : null;

    return (
        <DndStateProvider value={{ activeDragId, overId, isPanelOpen }}>
            <DndContext
                sensors={sensors}
                collisionDetection={customCollision}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={rectSortingStrategy}
                >
                    {children}
                </SortableContext>

                {/* Drag Overlay — only for panel items */}
                <DragOverlay
                    dropAnimation={{
                        duration: 180,
                        easing: "cubic-bezier(0.18,0.67,0.6,1.22)",
                    }}
                >
                    {activePanelOption &&
                        (() => {
                            const { Mini } = activePanelOption;
                            return (
                                <div
                                    className="rounded-xl border-2 bg-white shadow-2xl p-2.5"
                                    style={{
                                        width: 130,
                                        borderColor: activePanelOption.color,
                                    }}
                                >
                                    <p className="text-xs font-bold text-slate-700 mb-1">
                                        {activePanelOption.label}
                                    </p>
                                    <div className="w-full h-9 rounded-lg bg-slate-50 px-1 overflow-hidden">
                                        <Mini />
                                    </div>
                                </div>
                            );
                        })()}
                </DragOverlay>
            </DndContext>
        </DndStateProvider>
    );
}
