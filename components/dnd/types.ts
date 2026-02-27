// ─── DnD Types & Helpers ──────────────────────────────────────────────────────

export type ChartType = "bar" | "line" | "radar" | "pie";
export type BlockType = "text" | "chart";

export interface Block {
    id: string;
    type: BlockType;
    chartType?: ChartType; // only for chart blocks
}

export interface ChartOption {
    id: ChartType;
    label: string;
    color: string;
    Mini: React.FC;
}

// ─── Constants & Helpers ──────────────────────────────────────────────────────

export const CHART_BLOCK_PREFIX = "chart-";

export const isChartBlock = (id: unknown): boolean =>
    typeof id === "string" && id.startsWith(CHART_BLOCK_PREFIX);

/** Panel drag IDs always start with "panel::" */
export const isPanelDrag = (id: string | null): boolean =>
    id?.startsWith("panel::") ?? false;
