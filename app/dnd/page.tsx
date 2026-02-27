"use client";

import { useState } from "react";
import SortableList from "@/components/dnd/SortableList";
import { Task } from "@/types/task";

export default function PageOne() {

  const [items, setItems] = useState<Task[]>([
    { id: "1", label: "Task A" },
    { id: "2", label: "Task B" },
    { id: "3", label: "Task C" },
  ]);

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold mb-4">DND</h2>

      <SortableList
        items={items}
        onChange={setItems}
      />
    </div>
  );
}
