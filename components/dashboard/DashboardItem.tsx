// components/DashboardItem.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Edit2 } from "lucide-react";

export default function DashboardItem({ widget, availableWidgets, onReplace }: any) {
  const [isEditing, setIsEditing] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleReplaceClick = (e: React.MouseEvent, newId: number) => {
    e.stopPropagation();
    onReplace(widget.id, newId);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="h-32 bg-white rounded-lg shadow-md flex items-center justify-center relative group"
    >
      <div {...attributes} {...listeners} className="cursor-grab flex-1 h-full flex items-center justify-center text-sm font-semibold">
        {widget.label}
      </div>
      
      {widget.editable && (
        <button
          onClick={handleEditClick}
          className="absolute top-2 right-2 p-1.5 bg-gray-100 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <Edit2 size={14} />
        </button>
      )}

      {isEditing && availableWidgets.length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsEditing(false)}
          />
          <div className="absolute top-10 right-2 bg-white border rounded shadow-lg z-20 w-32 max-h-40 overflow-y-auto">
            {availableWidgets.map((w: any) => (
              <button
                key={w.id}
                onClick={(e) => handleReplaceClick(e, w.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {w.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}