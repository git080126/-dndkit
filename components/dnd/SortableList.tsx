"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";

type Props = {
    items: Task[];
    onChange: (items: Task[]) => void;
};

export default function SortableList({ items, onChange }: Props) {

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);

            const updated = arrayMove(items, oldIndex, newIndex);
            console.log("Old index:", oldIndex, "New index:", newIndex);
            console.log("Updated order:", updated);

            onChange(updated);
        }
    };

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                {items.map(item => (
                    <SortableItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                    />
                ))}
            </SortableContext>
        </DndContext>
    );
}

function SortableItem({ id, label }: Task) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

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
            {label}
        </div>
    );
}
