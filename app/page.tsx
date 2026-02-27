"use client";

/**
 * Dashboard Page — Uses modular DnD components from @/components/dnd
 *
 * This file is now slim — only layout + domain-specific config.
 * All DnD logic lives in the reusable components.
 */

import React, { useState, useEffect, type CSSProperties } from "react";
import { Settings2, MoveIcon } from "lucide-react";
import {
  DndSortableProvider,
  SortableBlock,
  SidePanel,
  ChartRenderer,
  CHART_OPTIONS,
  useDndState,
  loadBlocks,
  type Block,
  type ChartOption,
} from "@/components/dnd";

// ─── Domain Data ──────────────────────────────────────────────────────────────

const DEFAULT_BLOCKS: Block[] = [
  { id: "text-1", type: "text" },
  { id: "chart-1", type: "chart", chartType: "bar" },
  { id: "text-2", type: "text" },
  { id: "chart-2", type: "chart", chartType: "radar" },
];

const CHART_DATA = [
  { label: "Skills", value: 95 },
  { label: "Role", value: 90 },
  { label: "Experience", value: 33 },
  { label: "Responsibility", value: 45 },
  { label: "Education", value: 89 },
];

const TEXT_CONTENT: Record<string, { title: string; items: { label: string; value: string }[] }> = {
  "text-1": {
    title: "Candidate Summary",
    items: [
      { label: "Notice Period", value: "10 Days" },
      { label: "Work Pref", value: "Office" },
      { label: "Currency", value: "DKK" },
    ],
  },
  "text-2": {
    title: "Job Details",
    items: [
      { label: "Role", value: "Digital Mktg" },
      { label: "Location", value: "London" },
      { label: "Salary", value: "DKK 777" },
    ],
  },
};

// ─── Text Block UI ────────────────────────────────────────────────────────────

function TextBlockContent({ block }: { block: Block }) {
  const content = TEXT_CONTENT[block.id];
  if (!content) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
      <div className="h-1 w-full" style={{ background: "#06b6d4" }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{content.title}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {content.items.map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
              <p className="text-[10px] text-slate-400 font-medium">{item.label}</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chart Block UI ───────────────────────────────────────────────────────────

function ChartBlockContent({ block }: { block: Block }) {
  const { overId, isPanelOpen } = useDndState();
  const chartType = block.chartType ?? "bar";
  const activeOption = CHART_OPTIONS.find(c => c.id === chartType)!;
  const isOver = overId === block.id;

  const borderStyle: CSSProperties = isOver
    ? { border: "2px solid #6366f1", background: "#eef2ff" }
    : isPanelOpen
      ? { border: "2px dashed #a5b4fc", background: "#fff" }
      : { border: "2px solid transparent", background: "#fff" };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-150"
      style={{
        ...borderStyle,
        boxShadow: isOver ? "0 4px 20px rgba(99,102,241,0.15)" : "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div className="h-1 w-full" style={{ background: activeOption.color }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {block.id === "chart-1" ? "Assessment Overview" : "Skills Breakdown"}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${activeOption.color}15`, color: activeOption.color }}
            >
              {activeOption.label}
            </span>
            {isPanelOpen && !isOver && <span className="text-[10px] text-indigo-400">drop here</span>}
            {isOver && <span className="text-[10px] text-indigo-600 font-bold">release to apply</span>}
          </div>
        </div>
        <ChartRenderer chartType={chartType} color={activeOption.color} data={CHART_DATA} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPOC() {
  const [blocks, setBlocks] = useState<Block[]>(() => loadBlocks(DEFAULT_BLOCKS));
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <DndSortableProvider
      blocks={blocks}
      onBlocksChange={setBlocks}
      chartOptions={CHART_OPTIONS}
      isPanelOpen={panelOpen}
    >
      <div className="min-h-screen" style={{ background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Navbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">Candidate Report — Ritika</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {panelOpen
                ? "Drag chart style onto a block · Use ✥ handle to reorder blocks"
                : "Use ✥ handle to reorder · Click Customize to change charts"}
            </p>
          </div>
          <button
            onClick={() => setPanelOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: panelOpen ? "#6366f1" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            <Settings2 size={15} />
            {panelOpen ? "Close Panel" : "Customize"}
          </button>
        </div>

        {/* Grid */}
        <div
          className="p-6"
          style={{
            marginRight: panelOpen ? 256 : 0,
            transition: "margin 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {blocks.map(block => (
              <SortableBlock key={block.id} id={block.id}>
                {block.type === "text"
                  ? <TextBlockContent block={block} />
                  : <ChartBlockContent block={block} />
                }
              </SortableBlock>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        {panelOpen && <SidePanel options={CHART_OPTIONS} onClose={() => setPanelOpen(false)} />}
      </div>
    </DndSortableProvider>
  );
}