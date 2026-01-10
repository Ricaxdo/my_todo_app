"use client";

import TodoNavBar from "@/components/navigation/TodoNavBar";
import { useTodoDashboard } from "@/components/todo-dashboard"; // API pública del feature
import { Card } from "@/components/ui/card";

// Componentes del dominio Todo
import AddTaskForm from "../add-task-form/AddTaskForm";
import TaskList from "../task-list/TaskList";
import TodoStats from "../todo-stats/TodoStats";
import TodoFooter from "../todos/TodoFooter";
import TodoHeader from "../todos/TodoHeader";
import ToolBar from "../todos/ToolBar";

/**
 * Página principal del Todo Dashboard.
 *
 * Responsabilidad:
 * - Composición de UI
 * - Orquestación visual del estado (loading / skeleton / content)
 *
 * ❌ No contiene lógica de negocio
 * ✅ Toda la lógica vive en `useTodoDashboard`
 */
export default function TodoDashboard() {
  // Hook orquestador del feature
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
      {/* Background grid decorativo */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto px-6 pb-6 space-y-10">
        {/* Navbar fija */}
        <div
          id="app-navbar"
          className="sticky top-0 z-50 -mx-6 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 border-border"
        >
          <TodoNavBar />
        </div>

        {/* Header / Hero */}
        <section id="home">
          <TodoHeader />
        </section>

        {/* Skeleton mientras se cambia de workspace */}
        {isWorkspaceSwitching ? (
          <section id="progress" className="space-y-6">
            {/* Skeleton de stats */}
            <Card className="p-6 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </Card>

            {/* Skeleton del formulario */}
            <Card className="p-6 space-y-3">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </Card>

            {/* Skeleton de la lista */}
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
            {/* Stats y selector de fecha */}
            <section id="progress">
              <TodoStats
                activeCount={activeCount}
                userActiveCount={userActiveCount}
                completionRate={completionRate}
                selectedDate={selectedDate}
                onChangeDate={setSelectedDate}
              />
            </section>

            {/* Formulario para crear tareas */}
            <AddTaskForm
              newTask={newTask}
              setNewTask={setNewTask}
              onSubmit={handleAddTask}
              priority={priority}
              setPriority={setPriority}
              dueDate={dueDate}
              setDueDate={setDueDate}
              isPersonalWorkspace={isPersonalWorkspace}
              meId={meId ?? ""} // fallback para evitar nulls en UI
              members={members}
              assignees={assignees}
              setAssignees={setAssignees}
            />

            {/* Lista de tareas */}
            <section id="tasks" className="relative">
              <div id="tasks-anchor" className="absolute -top-6 h-1 w-1" />

              <main className="space-y-6">
                {/* Filtros */}
                <ToolBar
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                />

                {/* Task list */}
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

        {/* Footer */}
        <TodoFooter />
      </div>
    </div>
  );
}
