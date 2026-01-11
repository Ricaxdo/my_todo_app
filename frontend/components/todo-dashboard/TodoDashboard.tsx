"use client";

import TodoNavBar from "@/components/navigation/TodoNavBar";
import { useTodoDashboard } from "@/components/todo-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

import AddTaskForm from "../add-task-form/AddTaskForm";
import TaskList from "../task-list/TaskList";
import TodoStats from "../todo-stats/TodoStats";
import TodoFooter from "../todos/TodoFooter";
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto px-6 pb-6 space-y-10">
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-6 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-border"
        >
          <TodoNavBar />
        </div>

        <section id="home">
          <TodoHeader />
        </section>

        {isWorkspaceSwitching ? (
          <section id="progress" className="space-y-6">
            <Card className="p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </Card>

            <Card className="p-6 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </Card>

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
            <section id="progress">
              <TodoStats
                activeCount={activeCount}
                userActiveCount={userActiveCount}
                completionRate={completionRate}
                selectedDate={selectedDate}
                onChangeDate={setSelectedDate}
              />
            </section>

            {/* ✅ UX: si NO es hoy, explicamos y damos acción */}
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
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-full border border-border bg-muted/40 p-2">
                    <CalendarClock className="h-6 w-6" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="font-semibold text-xl">
                      No puedes crear tareas en días pasados
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 justify-end">
                      <Button
                        type="button"
                        onClick={() => setSelectedDate(startOfDay(new Date()))}
                      >
                        Ir a hoy
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

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
                  members={members}
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
