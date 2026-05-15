"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, ResponseType } from "@/types/screening.types";

type SortableQuestionListProps = {
  questions: Question[];
  onReorder: (questions: Question[]) => void;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onRemove: (id: string) => void;
  onEditStart?: () => void;
};

function SortableQuestionRow({
  question,
  index,
  onUpdate,
  onRemove,
  onEditStart,
}: {
  question: Question;
  index: number;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onRemove: (id: string) => void;
  onEditStart?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border/80 bg-muted/20 p-4",
        isDragging &&
          "z-10 border-primary/40 bg-card shadow-md ring-2 ring-primary/20"
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          className={cn(
            "mt-0.5 flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 active:cursor-grabbing",
            isDragging && "cursor-grabbing"
          )}
          aria-label={`Drag to reorder question ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Question {index + 1}
              {question.isCustom ? (
                <span className="text-foreground"> · Custom</span>
              ) : null}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove question ${index + 1}`}
              onClick={() => onRemove(question.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <label className="sr-only" htmlFor={`q-text-${question.id}`}>
            Question {index + 1} text
          </label>
          <textarea
            id={`q-text-${question.id}`}
            value={question.text}
            onChange={(e) => {
              onEditStart?.();
              onUpdate(question.id, { text: e.target.value });
            }}
            rows={3}
            className="mt-3 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              htmlFor={`q-type-${question.id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              Response type
            </label>
            <select
              id={`q-type-${question.id}`}
              value={question.responseType}
              onChange={(e) =>
                onUpdate(question.id, {
                  responseType: e.target.value as ResponseType,
                })
              }
              className="h-9 rounded-md border border-border bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <option value="text">Text</option>
              <option value="audio">Audio (placeholder)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortableQuestionList({
  questions,
  onReorder,
  onUpdate,
  onRemove,
  onEditStart,
}: SortableQuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(questions, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={questions.map((q) => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {questions.map((q, index) => (
            <SortableQuestionRow
              key={q.id}
              question={q}
              index={index}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onEditStart={onEditStart}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
