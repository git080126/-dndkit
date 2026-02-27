# @dnd-kit Proof of Concept (POC) Documentation

## Overview

This document outlines the architecture and implementation details for the **Drag and Drop Dashboard POC** using `@dnd-kit`. 

The core requirements achieved in this POC are:
1. **Sortable Grid**: A grid of dashboard blocks that can be freely reordered using drag-and-drop handles.
2. **Chart Type Swapping**: A side panel containing draggable "Chart Style" items that can be dropped onto specific "Chart Blocks" to instantly swap their visualization type (e.g., from Bar Chart to Radar Chart).
3. **Modular Reusability**: Providing a "drop-in" React architecture so that this functionality can be easily ported to any other application or dashboard.

---

## Technical Stack
- **Framework**: Next.js / React
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Charts**: `recharts`
- **Styling**: Tailwind CSS

---

## 1. Core `@dnd-kit` Concepts Used

Our implementation leverages the following core primitives from `@dnd-kit`:

- `<DndContext>`: The root provider that manages drag events, collision detection, and sensors.
- `<SortableContext>`: Contains a list of IDs representing the sortable items. Manages the sorting strategy (we use `rectSortingStrategy` for grids).
- `useSortable`: A hook that gives an item sortable capabilities (returns `setNodeRef`, `transform`, `transition`, `listeners`, etc.).
- `useDraggable`: A hook used for the side panel items (they can be dragged, but not sorted).
- `useDroppable`: A hook used specifically on the chart blocks to allow them to receive the side panel items.
- `<DragOverlay>`: Renders a visual "ghost" of the item currently being dragged (specifically used for the side panel items).

---

## 2. Modular Architecture 

To make the code reusable, we split the logic into distinct modules inside `@/components/dnd/`:

### A. **`DndSortableProvider.tsx`**
This is the heart of the system. It wraps `<DndContext>` and `<SortableContext>`. It handles:
- **Sensors**: Defining how far a pointer must move before a drag starts (e.g., 8px) to prevent accidental drags on clicks.
- **Drag Handlers**: `onDragStart`, `onDragOver`, and `onDragEnd`.
- **Custom Collision Detection**: Dynamically switching collision rules depending on *what* is being dragged.

### B. **`SortableBlock.tsx`**
A generic wrapper component. Anything passed inside `children` becomes a sortable item in the grid.
- Uses `useSortable` for reordering.
- Conditionally uses `useDroppable` if the block is configured to accept panel drops (e.g., chart blocks).
- Provides a unified `ref` that combines both Sortable and Droppable refs.

### C. **`SidePanel.tsx` & `PanelItem.tsx`**
The UI for selecting new chart types.
- `PanelItem` uses `useDraggable` with custom `data` indicating what chart type it represents.

### D. **Context & State (`DndStateContext.tsx`)**
A React Context that exposes the current DnD state (`activeDragId`, `overId`, `isPanelOpen`) to deeply nested child components without prop drilling. This allows blocks to visually highlight when a panel item is hovering over them.

---

## 3. The Custom Collision Detection Strategy (Crucial)

When combining simple list sorting with cross-container dragging, default collision detection algorithms often fail. We implemented a **conditional collision strategy**:

```typescript
const customCollision: CollisionDetection = (args) => {
  const activeId = args.active.id as string;
  
  // 1. If dragging a Side Panel item
  if (isPanelDrag(activeId)) {
    // Filter droppable containers to ONLY include Chart Blocks
    const chartDroppables = args.droppableContainers.filter((c) => isChartBlock(c.id));
    // Use strict `pointerWithin` collision
    return pointerWithin({ ...args, droppableContainers: chartDroppables });
  }
  
  // 2. If reordering a Grid Block
  // Use generous `rectIntersection` for sorting
  return rectIntersection(args);
};
```

---

## 4. API & Backend Integration Strategy

Right now, the POC uses `localStorage` just to demonstrate persistence. However, when connecting this to a real backend API, the frontend only needs to send a **minimal JSON payload** representing the user's layout and preferences.

### What data needs to be saved to the database?

Every time a user drops a block (reordering) or drops a new chart style (customizing), the frontend holds an array of blocks. **This array structure is exactly what needs to be saved to the backend.**

Example payload to save to the database (`PUT /api/user/dashboard-layout`):

```json
[
  { 
    "id": "text-1", 
    "type": "text" 
  },
  { 
    "id": "chart-1", 
    "type": "chart", 
    "chartType": "bar" 
  },
  { 
    "id": "text-2", 
    "type": "text" 
  },
  { 
    "id": "chart-2", 
    "type": "chart", 
    "chartType": "radar" 
  }
]
```

### How to handle the API flow?

1. **On App Load (Read):** 
   - When the user logs in, the frontend calls `GET /api/user/dashboard-layout`.
   - The backend returns the JSON array shown above.
   - The frontend loads this array into state, instantly restoring their exact block order and chart selections.

2. **On User Interaction (Write):**
   - Whenever the user drags a block to a new position, the frontend array is reordered.
   - Whenever the user swaps a chart (e.g. Pie to Bar), the `"chartType"` string in the array updates.
   - The frontend immediately sends the updated JSON array back to the backend (`PUT /api/user/dashboard-layout`) to save it silently in the background.

This is a **schema-less or JSON-based approach** on the backend. The backend does not need to know what "bar" or "radar" means, it merely stores the JSON string array per user ID, and returns it when they log in next time.

---

## 5. How to Implement in a New Project

To add this exact functionality to an existing dashboard, follow these steps:

### Step 1: Install Dependencies
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts lucide-react
```

### Step 2: Copy the `components/dnd` folder
Copy the entire `components/dnd` directory from this POC into your project's `components` folder.

### Step 3: Define your state and wrap your grid
In your main page or layout component, define your blocks array and wrap your grid mapping with `<DndSortableProvider>`.

```tsx
import { useState } from 'react';
import { 
  DndSortableProvider, 
  SortableBlock, 
  CHART_OPTIONS 
} from '@/components/dnd';

export default function MyDashboard() {
  const [blocks, setBlocks] = useState([
    { id: 'text-1', type: 'text' },
    { id: 'chart-1', type: 'chart', chartType: 'bar' }
  ]);

  return (
    <DndSortableProvider
      blocks={blocks}
      onBlocksChange={setBlocks}
      chartOptions={CHART_OPTIONS}
    >
      <div className="grid grid-cols-2 gap-4">
        {blocks.map(block => (
          {/* id matches block.id, must be unique */}
          <SortableBlock key={block.id} id={block.id}>
             {/* Your custom block UI based on block.type */}
             {block.type === 'text' ? <MyTextWidget /> : <MyChartWidget />}
          </SortableBlock>
        ))}
      </div>
    </DndSortableProvider>
  );
}
```

### Step 4: Accessing DnD State inside Blocks (Optional)
If you need your custom block UI to change appearance during dragging (e.g., highlighting borders), you can read from the DnD Context:

```tsx
import { useDndState } from '@/components/dnd';

function MyChartWidget({ blockId }) {
  const { overId, isPanelOpen } = useDndState();
  const isOver = overId === blockId;

  return (
    <div style={{ border: isOver ? '2px solid blue' : 'none' }}>
       {/* Chart Content */}
    </div>
  );
}
```

## Summary
By separating `@dnd-kit`'s complex event handlers and context providers into a dedicated `DndSortableProvider`, we keep the main dashboard UI completely clean. The use of custom collision detection ensures smooth visual feedback when combining sorting with drag-and-drop payload delivery.
