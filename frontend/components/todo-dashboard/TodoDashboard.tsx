"use client";

import TodoNavBar from "@/components/navigation/TodoNavBar";
import { useTodoDashboard } from "@/components/todo-dashboard"; // 👈 usa el index.ts
import { Card } from "@/components/ui/card";

import AddTaskForm from "../todos/AddTaskForm";
import TaskList from "../todos/TaskList";
import TodoFooter from "../todos/TodoFooter";
import TodoHeader from "../todos/TodoHeader";
import TodoStats from "../todos/TodoStats";
import ToolBar from "../todos/ToolBar";

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
                  members={members} // 👈 listo
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
