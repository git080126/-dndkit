"use client";

import React, { createContext, useContext } from "react";

// ─── DnD State Context ────────────────────────────────────────────────────────

interface DndState {
    /** Currently active drag item id */
    activeDragId: string | null;
    /** Currently hovered droppable id */
    overId: string | null;
    /** Whether the chart-swap panel is open */
    isPanelOpen: boolean;
}

const DndStateContext = createContext<DndState>({
    activeDragId: null,
    overId: null,
    isPanelOpen: false,
});

export const DndStateProvider = DndStateContext.Provider;

/** Hook to read DnD state from any child component */
export function useDndState() {
    return useContext(DndStateContext);
}
