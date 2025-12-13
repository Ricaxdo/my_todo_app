// src/features/todo/TodoDashboard.tsx
"use client";

import { useTodoDashboard } from "../app/hooks/useTodoDashboard";
import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";
import TodoFooter from "./TodoFooter";
import TodoHeader from "./TodoHeader";
import TodoStats from "./TodoStats";
import ToolBar from "./ToolBar";

export default function TodoDashboard() {
  const {
    newTask,
    setNewTask,
    activeFilter,
    setActiveFilter,
    handleAddTask,
    toggleTask, // (id: string) => Promise<void>
    deleteTask, // (id: string) => Promise<void>
    filteredTasks,
    activeCount,
    completionRate,
    selectedDate, // 👈 sin punto
    setSelectedDate,
    priority,
    setPriority,
  } = useTodoDashboard();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto p-6 space-y-10">
        <TodoHeader />

        <TodoStats
          activeCount={activeCount}
          completionRate={completionRate}
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
        />

        <AddTaskForm
          newTask={newTask}
          setNewTask={setNewTask}
          onSubmit={handleAddTask}
          priority={priority} // 👈
          setPriority={setPriority}
        />

        <main className="space-y-6">
          <ToolBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          <TaskList
            tasks={filteredTasks}
            toggleTask={toggleTask} // ahora tipos alineados (string)
            deleteTask={deleteTask} // idem
          />
        </main>

        <TodoFooter />
      </div>
    </div>
  );
}
