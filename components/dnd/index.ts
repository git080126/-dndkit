// ─── Barrel export ────────────────────────────────────────────────────────────

// Types & helpers
export type { Block, BlockType, ChartType, ChartOption } from "./types";
export { CHART_BLOCK_PREFIX, isChartBlock, isPanelDrag } from "./types";

// DnD core
export { DndSortableProvider } from "./DndSortableProvider";
export { DndStateProvider, useDndState } from "./DndStateContext";

// Block components
export { SortableBlock } from "./SortableBlock";
export { PanelItem } from "./PanelItem";
export { SidePanel } from "./SidePanel";

// Charts
export { ChartRenderer } from "./ChartRenderer";
export { CHART_OPTIONS, PIE_COLORS } from "./chartOptions";

// Persistence
export { loadBlocks, saveBlocks } from "./persistence";
