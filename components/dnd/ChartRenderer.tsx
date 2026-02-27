"use client";

import React from "react";
import {
    BarChart, Bar, LineChart, Line,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import type { ChartType } from "./types";
import { PIE_COLORS } from "./chartOptions";

// ─── Chart Renderer ───────────────────────────────────────────────────────────

interface ChartRendererProps {
    chartType: ChartType;
    color: string;
    /** Data array — each entry must have `label` and `value` keys */
    data: { label: string; value: number }[];
    height?: number;
}

export function ChartRenderer({
    chartType,
    color,
    data,
    height = 160,
}: ChartRendererProps) {
    const axis = { fontSize: 10, fill: "#94a3b8" };
    const tip = {
        fontSize: 12,
        borderRadius: 8,
        border: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    };
    const margin = { top: 4, right: 8, left: -20, bottom: 0 };

    if (chartType === "bar")
        return (
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data} margin={margin}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );

    if (chartType === "line")
        return (
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data} margin={margin}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={axis} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Line
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: color }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        );

    if (chartType === "radar")
        return (
            <ResponsiveContainer width="100%" height={height}>
                <RadarChart data={data} cx="50%" cy="50%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="label" tick={axis} />
                    <Radar
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.25}
                        strokeWidth={2}
                    />
                    <Tooltip contentStyle={tip} />
                </RadarChart>
            </ResponsiveContainer>
        );

    // pie (default)
    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    label={({ label, value }: { label: string; value: number }) =>
                        `${label} ${value}%`
                    }
                    labelLine={false}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={tip} />
            </PieChart>
        </ResponsiveContainer>
    );
}
