"use client";

import { useState } from "react";

type Task = {
  id: string;
  label: string;
};

export default function NativePOC() {

  // ✅ Production-style object structure
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", label: "Task A" },
    { id: "2", label: "Task B" },
    { id: "3", label: "Task C" },
  ]);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center pt-20">
      <h2 className="text-2xl font-bold mb-6">
        Native HTML5 Drag & Drop (Object)
      </h2>

      <div className="w-80">
        {tasks.map((task, index) => (
          <div
            key={task.id} // ✅ Always use stable id
            draggable

            // Store index manually
            onDragStart={() => setDragIndex(index)}

            onDragOver={(e) => e.preventDefault()}

            onDrop={() => {
              if (dragIndex === null) return;

              const updated = [...tasks];

              // Remove dragged item
              const [movedItem] = updated.splice(dragIndex, 1);

              // Insert at new position
              updated.splice(index, 0, movedItem);

              setTasks(updated);
            }}

            className="p-3 mb-2 rounded-lg bg-indigo-500 text-white cursor-grab shadow-md"
          >
            {task.label}
          </div>
        ))}
      </div>
    </div>
  );
}
