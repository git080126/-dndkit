"use client";

import { useState } from "react";
import SortableList from "@/components/dnd/SortableList";
import { Task } from "@/types/task";

export default function PageTwo() {

  const [items, setItems] = useState<Task[]>([
    { id: "a", label: "Item X" },
    { id: "b", label: "Item Y" },
    { id: "c", label: "Item Z" },
  ]);

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold mb-4">DND Demo Page 2</h2>

      <SortableList
        items={items}
        onChange={setItems}
      />
    </div>
  );
}
