import type { Block } from "./types";

// ─── LocalStorage Persistence ─────────────────────────────────────────────────

const DEFAULT_LS_KEY = "poc_dashboard_v3";

export function loadBlocks(
    defaultBlocks: Block[],
    key: string = DEFAULT_LS_KEY,
): Block[] {
    if (typeof window === "undefined") return defaultBlocks;
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as Block[]) : defaultBlocks;
    } catch {
        return defaultBlocks;
    }
}

export function saveBlocks(
    blocks: Block[],
    key: string = DEFAULT_LS_KEY,
): void {
    try {
        localStorage.setItem(key, JSON.stringify(blocks));
    } catch {
        /* quota exceeded — silently ignore */
    }
}
