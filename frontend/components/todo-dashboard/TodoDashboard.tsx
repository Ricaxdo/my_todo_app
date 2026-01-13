"use client";

import TodoNavBar from "@/components/navigation/TodoNavBar";
import { scrollToId } from "@/components/navigation/nav-scroll";
import { useTodoDashboard } from "@/components/todo-dashboard";
import { Card } from "@/components/ui/card";

import { useFooterNavigation } from "@/components/todos/hooks/useFooterNavigation";

import AddTaskForm from "../add-task-form/AddTaskForm";
import TaskList from "../task-list/TaskList";
import TodoStats from "../todo-stats/TodoStats";
import TodoHeader from "../todos/TodoHeader";
import ToolBar from "../tool-bar/ToolBar";

import TodoFooter from "@/components/todos/TodoFooter";

import { useState } from "react";

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
  const { footerOpen, openFooter, closeFooter } = useFooterNavigation();
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  return (
    <div
      className={[
        "h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/20",
        footerOpen ? "desk-lock" : "",
        "overflow-y-auto lg:overflow-hidden",
        "[--nav-h:64px]", // 👈 ajusta si tu navbar mide otra cosa
      ].join(" ")}
    >
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      {/* Wrapper general */}
      <div className="relative w-full px-4 pb-6 lg:px-8 lg:pb-10 desk-shell h-full min-h-0 flex flex-col">
        {/* Navbar sticky */}
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b border-border"
        >
          <div className="max-w-[1600px] mx-auto">
            <TodoNavBar
              onOpenFooter={() => {
                openFooter();
              }}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-[1600px] mx-auto w-full desk-content min-h-0 lg:h-[calc(100dvh-var(--nav-h))]">
          {/* Header */}
          <section
            id="home"
            className={[
              "pt-5 lg:pt-5 z-10",
              headerCollapsed ? "pb-1 lg:pb-1" : "pb-4 lg:pb-3",
            ].join(" ")}
          >
            <TodoHeader onCollapsedChange={setHeaderCollapsed} />
          </section>

          {isWorkspaceSwitching ? (
            // =========================
            // LOADING
            // =========================
            <div className="grid grid-cols-1 grid-2cols-800 gap-6 gap-8-800 flex-1 min-h-0 lg:flex-1 lg:min-h-0">
              <aside className="space-y-6">
                <Card className="p-6 space-y-3 sticky-800">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-24 w-full animate-pulse rounded bg-muted" />
                </Card>
              </aside>

              <main className="space-y-6 desk-main-scroll scrollbar-hover overflow-visible lg:overflow-y-auto lg:min-h-0">
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
            <div className="grid grid-cols-1 grid-2cols-800 gap-6 gap-8-800 flex-1 min-h-0 lg:flex-1 lg:min-h-0">
              <aside className="self-start min-h-0 overflow-y-auto scrollbar-hover">
                <div className="space-y-6 sticky-800">
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

              <main className="space-y-6 desk-main-scroll scrollbar-hover overflow-visible lg:overflow-y-auto lg:min-h-0">
                {isToday ? (
                  <section className="relative">
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
                  </section>
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

      {/* =========================
          FOOTER OVERLAY FULL SCREEN
         ========================= */}
      {footerOpen && (
        <div className="fixed inset-0 z-[60] bg-background">
          {/* backdrop suave (opcional) */}
          <div className="absolute inset-0 bg-black/30" />

          {/* contenido del footer */}
          <div className="relative h-full overflow-y-auto overscroll-contain touch-pan-y [webkit-overflow-scrolling:touch]">
            <section id="footer" className="min-h-[100dvh]">
              <TodoFooter
                onBack={() => {
                  closeFooter();
                  requestAnimationFrame(() => {
                    scrollToId("home", { duration: 800 });
                  });
                }}
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
