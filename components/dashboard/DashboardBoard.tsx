// components/DashboardBoard.tsx
"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import DashboardItem from "./DashboardItem";
import { saveLayout, loadLayout } from "@/lib/storage";
import { Widget } from "@/types/widget";

const defaultWidgets: Widget[] = [
  { id: 1, label: "Widget 1", editable: false },
  { id: 2, label: "Widget 2", editable: true,  },
  { id: 3, label: "Widget 3", editable: true,  },
  { id: 4, label: "Widget 4", editable: true,  },
  { id: 5, label: "Widget 5", editable: true, },
  { id: 6, label: "Widget 6", editable: true, },
  { id: 7, label: "Widget 7", editable: true, },
  { id: 8, label: "Widget 8", editable: false, },
];

const DISPLAY_COUNT = 2;

export default function DashboardBoard() {
  const [widgets, setWidgets] = useState(defaultWidgets.slice(0, DISPLAY_COUNT));

  useEffect(() => {
    const saved = loadLayout();
    if (saved && saved.length === DISPLAY_COUNT) {
      const ordered = saved
        .map((id) => defaultWidgets.find((w) => w.id === id))
        .filter(Boolean) as Widget[];
      if (ordered.length) setWidgets(ordered);
    }
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);
    const updated = arrayMove(widgets, oldIndex, newIndex);
    setWidgets(updated);
    saveLayout(updated.map((w) => w.id));
  };

  const handleReplace = (currentId: number, newId: number) => {
    const updated = widgets.map((w) => 
      w.id === currentId ? defaultWidgets.find((dw) => dw.id === newId)! : w
    );
    setWidgets(updated);
    saveLayout(updated.map((w) => w.id));
  };

  const getAvailableWidgets = (currentId: number) => {
    const displayedIds = widgets.map(w => w.id);
    return defaultWidgets.filter(w => !displayedIds.includes(w.id));
  };
"use client";

import React, { useState, useCallback, useEffect, CSSProperties } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart, Bar,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { GripVertical, Pencil, X, CheckCircle2, LayoutDashboard } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChartType = "bar" | "line" | "radar" | "pie" | "radialbar";

interface Block {
  blockId: string;     // unique per block (e.g. "s1-a", "s1-b")
  sectionId: string;   // which section it belongs to
  title: string;
  color: string;
  chartType: ChartType;
}

interface Section {
  sectionId: string;
  cols: 1 | 2;         // how many block columns in this section
}

// ─── Shared dummy data ────────────────────────────────────────────────────────
const SHARED_DATA = [
  { label: "Skills",         value: 95 },
  { label: "Role",           value: 90 },
  { label: "Experience",     value: 33 },
  { label: "Responsibility", value: 45 },
  { label: "Education",      value: 89 },
];
const PIE_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

// ─── Chart Renderer ───────────────────────────────────────────────────────────
function ChartRenderer({ chartType, color }: { chartType: ChartType; color: string }) {
  const h = 180;
  if (chartType === "bar") return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={SHARED_DATA} margin={{ top:4, right:8, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0,100]} tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"none", boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }} />
        <Bar dataKey="value" fill={color} radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
  if (chartType === "line") return (
    <ResponsiveContainer width="100%" height={h}>
      <LineChart data={SHARED_DATA} margin={{ top:4, right:8, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis domain={[0,100]} tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"none" }} />
        <Line dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r:3, fill:color }} activeDot={{ r:5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
  if (chartType === "radar") return (
    <ResponsiveContainer width="100%" height={h}>
      <RadarChart data={SHARED_DATA} cx="50%" cy="50%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="label" tick={{ fontSize:10, fill:"#94a3b8" }} />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"none" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
  if (chartType === "pie") return (
    <ResponsiveContainer width="100%" height={h}>
      <PieChart>
        <Pie data={SHARED_DATA} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius="65%"
          label={({ label, value }: { label: string; value: number }) => `${label} ${value}%`} labelLine={false}>
          {SHARED_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"none" }} />
      </PieChart>
    </ResponsiveContainer>
  );
  if (chartType === "radialbar") {
    const data = SHARED_DATA.map((d, i) => ({ ...d, fill: PIE_COLORS[i % PIE_COLORS.length] }));
    return (
      <ResponsiveContainer width="100%" height={h}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data}>
          <RadialBar dataKey="value" background={{ fill:"#f1f5f9" }} cornerRadius={4} />
          <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"none" }} />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  }
  return null;
}

// ─── Chart Panel Options ──────────────────────────────────────────────────────
interface ChartOption { id: ChartType; label: string; Mini: React.FC; }

const CHART_OPTIONS: ChartOption[] = [
  {
    id: "bar", label: "Bar Chart",
    Mini: () => (
      <svg viewBox="0 0 80 36" width="100%" height="100%">
        {[14,26,20,36,24].map((h, i) => (
          <rect key={i} x={3+i*15} y={36-h} width={10} height={h} rx={2} fill="#6366f1" opacity={0.85} />
        ))}
      </svg>
    ),
  },
  {
    id: "line", label: "Line Chart",
    Mini: () => (
      <svg viewBox="0 0 80 36" width="100%" height="100%">
        <polyline points="4,28 20,18 36,23 52,8 68,14" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {([[4,28],[20,18],[36,23],[52,8],[68,14]] as [number,number][]).map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill="#06b6d4" />
        ))}
      </svg>
    ),
  },
  {
    id: "radar", label: "Radar Chart",
    Mini: () => (
      <svg viewBox="0 0 80 36" width="100%" height="100%">
        <polygon points="40,4 68,20 58,34 22,34 12,20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        <polygon points="40,12 58,22 52,30 28,30 22,22" fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "pie", label: "Pie Chart",
    Mini: () => (
      <svg viewBox="0 0 80 36" width="100%" height="100%">
        {(["#6366f1","#06b6d4","#f59e0b","#10b981"] as string[]).map((c, i) => {
          const s = [0,0.4,0.7,0.85], e = [0.4,0.7,0.85,1.0];
          const a = (p: number): [number,number] => [40+14*Math.cos(2*Math.PI*p-Math.PI/2), 18+14*Math.sin(2*Math.PI*p-Math.PI/2)];
          const [x1,y1] = a(s[i]); const [x2,y2] = a(e[i]);
          return <path key={i} d={`M40,18 L${x1},${y1} A14,14 0 ${e[i]-s[i]>0.5?1:0},1 ${x2},${y2} Z`} fill={c} stroke="white" strokeWidth="1" />;
        })}
      </svg>
    ),
  },
  {
    id: "radialbar", label: "Radial Bar",
    Mini: () => (
      <svg viewBox="0 0 80 36" width="100%" height="100%">
        {[16,13,10,7].map((r, i) => (
          <circle key={i} cx={40} cy={18} r={r} fill="none"
            stroke={PIE_COLORS[i]} strokeWidth={3}
            strokeDasharray={`${[28,22,18,14][i]} 100`} strokeLinecap="round" />
        ))}
      </svg>
    ),
  },
];

// ─── Draggable Panel Item ─────────────────────────────────────────────────────
function PanelItem({ option, isActive, onClickApply }: {
  option: ChartOption;
  isActive: boolean;
  onClickApply: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel::${option.id}`,
    data: { source: "panel", chartType: option.id },
  });
  const { Mini } = option;
  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border-2 overflow-hidden transition-all"
      style={{
        opacity: isDragging ? 0.3 : 1,
        borderColor: isActive ? option.color : "#e2e8f0",
        background: isActive ? `${option.color}0d` : "#fff",
      }}
    >
      <div {...listeners} {...attributes} className="p-2.5 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">{option.label}</span>
          <div className="flex items-center gap-1">
            {isActive && <CheckCircle2 size={12} style={{ color: option.color }} />}
            <GripVertical size={12} className="text-slate-300" />
          </div>
        </div>
        <div className="w-full h-10 rounded-lg bg-slate-50 overflow-hidden flex items-center px-1">
          <Mini />
        </div>
      </div>
      <button
        onClick={onClickApply}
        className="w-full py-1.5 text-[10px] font-semibold border-t transition-colors"
        style={{
          borderColor: isActive ? `${option.color}30` : "#f1f5f9",
          color: isActive ? option.color : "#94a3b8",
          background: isActive ? `${option.color}08` : "#fafafa",
        }}
      >
        {isActive ? "✓ Applied" : "Click to apply"}
      </button>
    </div>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────
function SidePanel({ block, onApply, onClose }: {
  block: Block;
  onApply: (blockId: string, ct: ChartType) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full z-30 bg-white flex flex-col"
        style={{ width:260, boxShadow:"-6px 0 32px rgba(0,0,0,0.12)", animation:"slideIn 0.25s cubic-bezier(0.4,0,0.2,1)" }}
      >
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Chart Style</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{block.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X size={14} className="text-slate-500" />
          </button>
        </div>
        <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
          <GripVertical size={11} className="text-indigo-400" />
          <p className="text-[10px] text-indigo-500 font-medium">Drag onto a block, or click to apply</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {CHART_OPTIONS.map(opt => (
            <PanelItem
              key={opt.id}
              option={opt}
              isActive={block.chartType === opt.id}
              onClickApply={() => onApply(block.blockId, opt.id)}
            />
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 text-center">Same data · different visualization</p>
        </div>
      </div>
    </>
  );
}

// ─── Individual Chart Block (droppable) ──────────────────────────────────────
function ChartBlock({ block, isDropTarget, onEdit }: {
  block: Block;
  isDropTarget: boolean;
  onEdit: (blockId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { setNodeRef } = useDroppable({ id: `drop::${block.blockId}`, data: { blockId: block.blockId } });

  const boxStyle: CSSProperties = {
    background: isDropTarget ? "#eef2ff" : "#fff",
    border: `2px solid ${isDropTarget ? "#6366f1" : "transparent"}`,
    borderRadius: "1rem",
    overflow: "hidden",
    boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.1)" : "0 1px 8px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s, border-color 0.15s, background 0.15s",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={boxStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-1 w-full" style={{ background: block.color }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{block.title}</span>
          <span className="text-[10px] text-slate-300">{CHART_OPTIONS.find(c => c.id === block.chartType)?.label}</span>
        </div>
        <ChartRenderer chartType={block.chartType} color={block.color} />
      </div>
      <button
        onClick={() => onEdit(block.blockId)}
        className="absolute top-2.5 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-md hover:scale-105 active:scale-95"
        style={{
          background: block.color,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 0.15s, transform 0.1s",
        }}
      >
        <Pencil size={11} /> Edit
      </button>
    </div>
  );
}

// ─── Sortable Section Row ─────────────────────────────────────────────────────
function SortableSectionRow({ section, blocks, overBlockId, activeInfo, onEdit }: {
  section: Section;
  blocks: Block[];
  overBlockId: string | null;
  activeInfo: { source: string } | null;
  onEdit: (blockId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.sectionId });

  const wrapStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={wrapStyle} className="relative group">
      {/* Section drag handle */}
      <div
        {...attributes} {...listeners}
        className="absolute -left-5 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Drag to reorder section"
      >
        <GripVertical size={16} className="text-slate-400" />
      </div>

      <div className={`grid gap-4 ${section.cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {blocks.map(block => (
          <ChartBlock
            key={block.blockId}
            block={block}
            isDropTarget={overBlockId === block.blockId && activeInfo?.source === "panel"}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Persistence ─────────────────────────────────────────────────────────────
const LS_BLOCKS   = "dashboard_poc_blocks";
const LS_SECTIONS = "dashboard_poc_sections";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded etc */ }
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_SECTIONS: Section[] = [
  { sectionId: "sec1", cols: 1 },
  { sectionId: "sec2", cols: 2 },
  { sectionId: "sec3", cols: 2 },
  { sectionId: "sec4", cols: 1 },
  { sectionId: "sec5", cols: 2 },
  { sectionId: "sec6", cols: 1 },
];

const INITIAL_BLOCKS: Block[] = [
  { blockId:"sec1-a", sectionId:"sec1", title:"Overall Assessment",        color:"#6366f1", chartType:"bar"      },
  { blockId:"sec2-a", sectionId:"sec2", title:"CV Assessment",             color:"#06b6d4", chartType:"bar"      },
  { blockId:"sec2-b", sectionId:"sec2", title:"CV Breakdown",              color:"#06b6d4", chartType:"radar"    },
  { blockId:"sec3-a", sectionId:"sec3", title:"Initial Assessment",        color:"#f59e0b", chartType:"line"     },
  { blockId:"sec3-b", sectionId:"sec3", title:"Initial Breakdown",         color:"#f59e0b", chartType:"pie"      },
  { blockId:"sec4-a", sectionId:"sec4", title:"Hiring-Critical Skills",    color:"#10b981", chartType:"radialbar"},
  { blockId:"sec5-a", sectionId:"sec5", title:"Authenticity Score",        color:"#8b5cf6", chartType:"pie"      },
  { blockId:"sec5-b", sectionId:"sec5", title:"Compliance Check",          color:"#8b5cf6", chartType:"bar"      },
  { blockId:"sec6-a", sectionId:"sec6", title:"Candidate Experience",      color:"#ec4899", chartType:"line"     },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const [sections, setSections] = useState<Section[]>(() =>
    loadFromStorage<Section[]>(LS_SECTIONS, INITIAL_SECTIONS)
  );
  const [blocks, setBlocks] = useState<Block[]>(() =>
    loadFromStorage<Block[]>(LS_BLOCKS, INITIAL_BLOCKS)
  );
  const [panelBlockId, setPanelBlockId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeInfo,   setActiveInfo]   = useState<{ source: string; chartType?: ChartType } | null>(null);
  const [overBlockId,  setOverBlockId]  = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Persist to localStorage on every change
  useEffect(() => { saveToStorage(LS_SECTIONS, sections); }, [sections]);
  useEffect(() => { saveToStorage(LS_BLOCKS,   blocks);   }, [blocks]);

  const panelBlock = panelBlockId ? blocks.find(b => b.blockId === panelBlockId) ?? null : null;

  const applyChartType = useCallback((blockId: string, ct: ChartType) => {
    setBlocks(prev => prev.map(b => b.blockId === blockId ? { ...b, chartType: ct } : b));
  }, []);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveDragId(e.active.id as string);
    setActiveInfo(e.active.data.current as { source: string; chartType?: ChartType });
  }, []);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    setOverBlockId((e.over?.data?.current as { blockId?: string } | undefined)?.blockId ?? null);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const info = activeInfo;
    setActiveDragId(null); setActiveInfo(null); setOverBlockId(null);
    const { active, over } = e;
    if (!over) return;

    // Panel → Block: apply chart style ONLY to the dropped block
    if (info?.source === "panel" && info.chartType) {
      // over.id is always "drop::blockId" — extract reliably to avoid section ID collision
      const overId = over.id as string;
      const targetBlockId = overId.startsWith("drop::") ? overId.replace("drop::", "") : null;
      if (targetBlockId) applyChartType(targetBlockId, info.chartType);
      return;
    }

    // Section reorder
    if (info?.source !== "panel") {
      const fromId = active.id as string;
      const toId   = over.id as string;
      if (fromId === toId) return;
      setSections(prev => arrayMove(prev, prev.findIndex(s => s.sectionId === fromId), prev.findIndex(s => s.sectionId === toId)));
    }
  }, [activeInfo, panelBlockId, applyChartType]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveDragId(null); setActiveInfo(null); setOverBlockId(null); }}
    >
      <div className="min-h-screen" style={{ background:"#f1f5f9", fontFamily:"'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        {/* Navbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-3 sticky top-0 z-10">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <LayoutDashboard size={16} color="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">Candidate Report — Ritika</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Drag ≡ to reorder sections · Hover block → Edit to change chart style</p>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 pl-10 flex flex-col gap-6"
          style={{ marginRight: panelBlock ? 260 : 0, transition:"margin 0.25s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <SortableContext items={sections.map(s => s.sectionId)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SortableSectionRow
                key={section.sectionId}
                section={section}
                blocks={blocks.filter(b => b.sectionId === section.sectionId)}
                overBlockId={overBlockId}
                activeInfo={activeInfo}
                onEdit={(blockId) => setPanelBlockId(blockId)}
              />
            ))}
          </SortableContext>
        </div>

        {/* Side Panel */}
        {panelBlock && (
          <SidePanel
            block={blocks.find(b => b.blockId === panelBlock.blockId)!}
            onApply={(blockId, ct) => { applyChartType(blockId, ct); }}
            onClose={() => setPanelBlockId(null)}
          />
        )}

        {/* Drag Overlay — only for panel items */}
        <DragOverlay dropAnimation={{ duration:180, easing:"cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeDragId?.startsWith("panel::") && activeInfo?.chartType && (() => {
            const opt = CHART_OPTIONS.find(o => o.id === activeInfo.chartType);
            if (!opt) return null;
            const { Mini } = opt;
            return (
              <div className="rounded-xl border-2 bg-white shadow-2xl p-2.5" style={{ width:130, borderColor: opt.color }}>
                <p className="text-xs font-bold text-slate-700 mb-1">{opt.label}</p>
                <div className="w-full h-9 rounded-lg bg-slate-50 px-1 overflow-hidden"><Mini /></div>
              </div>
            );
          })()}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
  return (
    <div className="p-10 overflow-x-hidden min-h-screen">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)}>
          <div className="grid grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <DashboardItem
                key={widget.id}
                widget={widget}
                availableWidgets={getAvailableWidgets(widget.id)}
                onReplace={handleReplace}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}