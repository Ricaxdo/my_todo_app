"use client";

import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { useTodoDashboard } from "../app/hooks/useTodoDashboard";
import AddTaskForm from "./AddTaskForm";
import TaskList from "./TaskList";
import TodoFooter from "./TodoFooter";
import TodoHeader from "./TodoHeader";
import TodoNavBar from "./TodoNavBar";
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
    isWorkspaceSwitching,
    dueDate,
    setDueDate,
    members,
    assignees,
    setAssignees,
    isPersonalWorkspace,
    meId,
  } = useTodoDashboard();

  const assigneeMembers = useMemo(
    () =>
      members.map((m) => ({
        userId: m.id, // 👈 aquí asumimos que m.id ES el userId real
        name: m.name,
      })),
    [members]
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto px-6 pb-6 space-y-10">
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-6 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-border"
        >
          <TodoNavBar />
        </div>

        {/* HOME */}
        <section id="home">
          <TodoHeader />
        </section>

        {isWorkspaceSwitching ? (
          <section id="progress" className="space-y-6">
            {/* skeleton PROGRESS */}
            <Card className="p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </Card>

            {/* skeleton ADD FORM */}
            <Card className="p-6 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </Card>

            {/* skeleton TASK LIST */}
            <section id="tasks" className="relative">
              <div id="tasks-anchor" className="absolute -top-6 h-1 w-1" />
              <Card className="p-6 space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </Card>
            </section>
          </section>
        ) : (
          <>
            {/* PROGRESS */}
            <section id="progress">
              <TodoStats
                activeCount={activeCount}
                completionRate={completionRate}
                selectedDate={selectedDate}
                onChangeDate={setSelectedDate}
              />
            </section>

            <AddTaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              onSubmit={handleAddTask}
              priority={priority}
              setPriority={setPriority}
              dueDate={dueDate}
              setDueDate={setDueDate}
              isPersonalWorkspace={isPersonalWorkspace}
              meId={meId ?? ""} // ✅ fallback para no romper types
              members={members}
              assignees={assignees}
              setAssignees={setAssignees}
            />

            {/* TASKS */}
            <section id="tasks" className="relative">
              <div id="tasks-anchor" className="absolute -top-6 h-1 w-1" />

              <main className="space-y-6">
                <ToolBar
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                />

                <TaskList
                  tasks={filteredTasks}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  members={assigneeMembers}
                  isPersonalWorkspace={isPersonalWorkspace}
                  meId={meId}
                />
              </main>
            </section>
          </>
        )}

        <TodoFooter />
      </div>
    </div>
  );
}
