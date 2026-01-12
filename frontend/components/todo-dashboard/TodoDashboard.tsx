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

      <div className="relative w-full px-4 pb-6 lg:px-8 lg:pb-10">
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-b border-border"
        >
          <div className="max-w-[1600px] mx-auto">
            <TodoNavBar />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto">
          {/* Header section - full width on all screens */}
          <section id="home" className="pt-5 pb-4 lg:pt-5 lg:pb-3">
            <TodoHeader />
          </section>

          {isWorkspaceSwitching ? (
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8">
              {/* Left sidebar loading */}
              <aside className="space-y-6">
                <Card className="p-6 space-y-3 lg:sticky lg:top-20">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-24 w-full animate-pulse rounded bg-muted" />
                </Card>
              </aside>

              {/* Main content loading */}
              <main className="space-y-6">
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
              </main>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8">
              <aside className="space-y-6">
                <div className="lg:sticky lg:top-20">
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

              <main className="space-y-6 min-w-0">
                {/* Add Task Form or Date Warning */}
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
                            onClick={() =>
                              setSelectedDate(startOfDay(new Date()))
                            }
                          >
                            Ir a hoy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Tasks Section */}
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
              </main>
            </div>
          )}

          <div className="pt-10 lg:pt-16">
            <TodoFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
