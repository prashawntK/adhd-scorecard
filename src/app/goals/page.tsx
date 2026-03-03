"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { GoalList } from "@/components/goals/GoalList";
import { GoalForm, type GoalFormData } from "@/components/goals/GoalForm";
import type { Goal } from "@/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchGoals = useCallback(async () => {
    const res = await fetch(`/api/goals?archived=${showArchived}`);
    const data = await res.json();
    setGoals(data);
  }, [showArchived]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  async function handleAdd(data: GoalFormData) {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAddModal(false);
    fetchGoals();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Goals</h1>
          <p className="text-sm text-gray-400">Manage your daily targets</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Goal
        </Button>
      </div>

      {/* Archive toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !showArchived
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            showArchived
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Archived
        </button>
      </div>

      <GoalList goals={goals} onRefresh={fetchGoals} />

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Goal"
      >
        <GoalForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
          submitLabel="Create Goal"
        />
      </Modal>
    </div>
  );
}
