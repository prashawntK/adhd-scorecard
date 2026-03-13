"use client";

import { useState } from "react";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ChoreForm, type ChoreFormData } from "./ChoreForm";
import type { Chore } from "@/types";
import { useToast } from "@/lib/toast";

type ChoreWithMeta = Chore & { totalMinutesSpent?: number };

interface ChoreListProps {
  items: ChoreWithMeta[];
  onRefresh: () => void;
}

function timeLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function deadlineLabel(deadline: Date | string): string {
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return `${diff} days left`;
  return `${Math.ceil(diff / 7)} weeks left`;
}

function deadlineColor(deadline: Date | string): string {
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff <= 0) return "text-error";
  if (diff <= 3) return "text-streak";
  if (diff <= 7) return "text-warning";
  return "text-gray-400";
}

export function ChoreList({ items, onRefresh }: ChoreListProps) {
  const [editingItem, setEditingItem] = useState<ChoreWithMeta | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  async function handleEdit(data: ChoreFormData) {
    if (!editingItem) return;
    try {
      await fetch(`/api/chores/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEditingItem(null);
      onRefresh();
      toastSuccess("Chore updated", data.name);
    } catch {
      toastError("Failed to update chore");
    }
  }

  async function handleArchive(item: ChoreWithMeta) {
    try {
      await fetch(`/api/chores/${item.id}`, { method: "DELETE" });
      onRefresh();
      toastSuccess("Chore archived", item.name);
    } catch {
      toastError("Failed to archive chore");
    }
  }

  async function handleRestore(item: ChoreWithMeta) {
    try {
      await fetch(`/api/chores/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false, archivedAt: null }),
      });
      onRefresh();
      toastSuccess("Chore restored", item.name);
    } catch {
      toastError("Failed to restore chore");
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-3xl mb-2">{"\u{1F9F9}"}</p>
        <p>No chores yet — add your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => {
          const spent = item.totalMinutesSpent ?? 0;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 glass-card px-4 py-3",
                item.isArchived && "opacity-50"
              )}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-100 truncate">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn("text-xs font-medium", deadlineColor(item.deadline))}
                  >
                    {deadlineLabel(item.deadline)}
                  </span>
                  <span className="text-xs text-gray-600">{"\u00B7"}</span>
                  <span className="text-xs text-gray-500">
                    ~{timeLabel(item.estimatedMinutes)}
                  </span>
                  {spent > 0 && (
                    <>
                      <span className="text-xs text-gray-600">{"\u00B7"}</span>
                      <span className="text-xs text-gray-500">
                        {timeLabel(spent)} spent
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!item.isArchived ? (
                  <>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-surface-2"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleArchive(item)}
                      className="p-2 rounded-lg text-gray-500 hover:text-streak hover:bg-surface-2"
                    >
                      <Archive size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestore(item)}
                    className="p-2 rounded-lg text-gray-500 hover:text-success hover:bg-surface-2"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Chore"
      >
        {editingItem && (
          <ChoreForm
            initial={{
              name: editingItem.name,
              emoji: editingItem.emoji,
              deadline: new Date(editingItem.deadline).toISOString(),
              estimatedMinutes: editingItem.estimatedMinutes,
              description: editingItem.description ?? "",
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditingItem(null)}
            submitLabel="Update"
          />
        )}
      </Modal>
    </>
  );
}
