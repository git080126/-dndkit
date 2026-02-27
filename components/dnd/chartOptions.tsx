import React from "react";
import type { ChartOption } from "./types";

// ─── Chart Options with Mini SVG Previews ─────────────────────────────────────

export const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

export const CHART_OPTIONS: ChartOption[] = [
    {
        id: "bar",
        label: "Bar Chart",
        color: "#6366f1",
        Mini: () => (
            <svg viewBox="0 0 80 36" width="100%" height="100%">
                {[14, 26, 20, 36, 24].map((h, i) => (
                    <rect
                        key={i}
                        x={3 + i * 15}
                        y={36 - h}
                        width={10}
                        height={h}
                        rx={2}
                        fill="#6366f1"
                        opacity={0.85}
                    />
                ))}
            </svg>
        ),
    },
    {
        id: "line",
        label: "Line Chart",
        color: "#06b6d4",
        Mini: () => (
            <svg viewBox="0 0 80 36" width="100%" height="100%">
                <polyline
                    points="4,28 20,18 36,23 52,8 68,14"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {(
                    [
                        [4, 28],
                        [20, 18],
                        [36, 23],
                        [52, 8],
                        [68, 14],
                    ] as [number, number][]
                ).map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={2.5} fill="#06b6d4" />
                ))}
            </svg>
        ),
    },
    {
        id: "radar",
        label: "Radar Chart",
        color: "#8b5cf6",
        Mini: () => (
            <svg viewBox="0 0 80 36" width="100%" height="100%">
                <polygon
                    points="40,4 68,20 58,34 22,34 12,20"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <polygon
                    points="40,12 58,22 52,30 28,30 22,22"
                    fill="#8b5cf620"
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                />
            </svg>
        ),
    },
    {
        id: "pie",
        label: "Pie Chart",
        color: "#f59e0b",
        Mini: () => (
            <svg viewBox="0 0 80 36" width="100%" height="100%">
                {(["#6366f1", "#06b6d4", "#f59e0b", "#10b981"] as string[]).map(
                    (c, i) => {
                        const s = [0, 0.4, 0.7, 0.85],
                            e = [0.4, 0.7, 0.85, 1.0];
                        const pt = (p: number): [number, number] => [
                            40 + 14 * Math.cos(2 * Math.PI * p - Math.PI / 2),
                            18 + 14 * Math.sin(2 * Math.PI * p - Math.PI / 2),
                        ];
                        const [x1, y1] = pt(s[i]);
                        const [x2, y2] = pt(e[i]);
                        return (
                            <path
                                key={i}
                                d={`M40,18 L${x1},${y1} A14,14 0 ${e[i] - s[i] > 0.5 ? 1 : 0},1 ${x2},${y2} Z`}
                                fill={c}
                                stroke="white"
                                strokeWidth="1"
                            />
                        );
                    },
                )}
            </svg>
        ),
    },
];
