"use client";

import TodoNavBar from "@/components/navigation/TodoNavBar";
import { useTodoDashboard } from "@/components/todo-dashboard";
import { Card } from "@/components/ui/card";

import AddTaskForm from "../add-task-form/AddTaskForm";
import TaskList from "../task-list/TaskList";
import TodoStats from "../todo-stats/TodoStats";
import TodoHeader from "../todos/TodoHeader";
import ToolBar from "../tool-bar/ToolBar";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export default function TodoDashboard() {
  const {
    newTask,
    setNewTask,
    activeFilter,
    setActiveFilter,
    handleAddTask,
    toggleTask,
    deleteTask,
    filteredTasks,
    activeCount,
    completionRate,
    selectedDate,
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
    userActiveCount,
  } = useTodoDashboard();

  const isToday = isSameDay(selectedDate, new Date());

  return (
    // ≤800: scroll normal (desk-lock no aplica)
    // ≥801: lock global y main interno scrollea
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/20 desk-lock">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      {/* Wrapper general (✅ ahora se vuelve “shell” desde 801 con CSS, no con lg:) */}
      <div className="relative w-full px-4 pb-6 lg:px-8 lg:pb-10 desk-shell">
        {/* Navbar sticky */}
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b border-border"
        >
          <div className="max-w-[1600px] mx-auto">
            <TodoNavBar />
          </div>
        </div>

        {/* Contenido (✅ flex-1 desde 801 con desk-content) */}
        <div className="max-w-[1600px] mx-auto w-full desk-content">
          {/* Header */}
          <section id="home" className="pt-5 pb-4 lg:pt-5 lg:pb-3">
            <TodoHeader />
          </section>

          {isWorkspaceSwitching ? (
            // =========================
            // LOADING
            // =========================
            <div className="grid grid-cols-1 grid-2cols-800 gap-6 gap-8-800 flex-1 min-h-0">
              <aside className="space-y-6">
                <Card className="p-6 space-y-3 sticky-800">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-24 w-full animate-pulse rounded bg-muted" />
                </Card>
              </aside>

              {/* ≤800: body scrollea; ≥801: main scrollea */}
              <main className="space-y-6 desk-main-scroll scrollbar-hover">
                <Card className="p-6 space-y-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                </Card>

                <Card className="p-6 space-y-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="h-10 w-full animate-pulse rounded bg-muted" />
                </Card>

                <div className="h-6" />
              </main>
            </div>
          ) : (
            // =========================
            // NORMAL
            // =========================
            <div className="grid grid-cols-1 grid-2cols-800 gap-6 gap-8-800 flex-1 min-h-0">
              <aside className="space-y-6">
                <div className="sticky-800">
                  <section id="progress">
                    <TodoStats
                      activeCount={activeCount}
                      userActiveCount={userActiveCount}
                      completionRate={completionRate}
                      selectedDate={selectedDate}
                      onChangeDate={setSelectedDate}
                    />
                  </section>
                </div>
              </aside>

              {/* ✅ Scroll interno desde 801 */}
              <main className="space-y-6 desk-main-scroll scrollbar-hover">
                {isToday ? (
                  <AddTaskForm
                    newTask={newTask}
                    setNewTask={setNewTask}
                    onSubmit={handleAddTask}
                    priority={priority}
                    setPriority={setPriority}
                    dueDate={dueDate}
                    setDueDate={setDueDate}
                    isPersonalWorkspace={isPersonalWorkspace}
                    meId={meId ?? ""}
                    members={members}
                    assignees={assignees}
                    setAssignees={setAssignees}
                  />
                ) : (
                  <Card className="p-6">
                    No puedes crear tareas en días pasados.
                  </Card>
                )}

                <section id="tasks" className="relative space-y-6">
                  <div id="tasks-anchor" className="absolute -top-6 h-1 w-1" />

                  <ToolBar
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                  />

                  <TaskList
                    tasks={filteredTasks}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    members={members}
                    isPersonalWorkspace={isPersonalWorkspace}
                    meId={meId}
                  />
                </section>

                <div className="h-6" />
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
