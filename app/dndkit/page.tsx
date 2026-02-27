// DND Kit  main 3 events: DragStart, DragOver, DragEnd
"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Task = {
  id: string;
  label: string;
};

function SortableItem({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 mb-2 rounded-lg bg-purple-600 text-white cursor-grab shadow-md"
    >
      {task.label}
    </div>
  );
}

export default function DndKitPOC() {
  const [items, setItems] = useState<Task[]>([
    { id: "1", label: "Task A" },
    { id: "2", label: "Task B" },
    { id: "3", label: "Task C" },
  ]);

  // Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag Started");
    console.log("Active Item ID:", event.active.id);
  };

  // Drag Over (Hover)
  const handleDragOver = (event: DragOverEvent) => {
    if (event.over) {
      console.log(" Hovering Over ID:", event.over.id);
    }
  };

  //  Drag End (Drop happens here)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log(" Drag End Triggered");
    console.log("Active ID:", active?.id);
    console.log("Over ID:", over?.id);

    if (!over) {
      console.log("Dropped outside valid area");
      return;
    }

    if (active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = prevItems.findIndex(
          (item) => item.id === over.id
        );

        console.log("Old Index:", oldIndex);
        console.log("New Index:", newIndex);
        console.log("Reordering using arrayMove()");

        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20">
      <h2 className="text-2xl font-bold mb-6">
        @dnd-kit Drag & Drop (Working + Debug)
      </h2>

      <div className="w-80">
        <DndContext
          collisionDetection={closestCenter} // nearest center detection
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((task) => (
              <SortableItem key={task.id} task={task} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
