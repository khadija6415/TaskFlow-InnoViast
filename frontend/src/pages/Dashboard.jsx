import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import DashboardCharts from "../components/DashboardCharts";
import Avatar from "../components/Avatar";
import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  addCommentApi,
  getStatsApi,
} from "../api/tasks";
import { getAllUsersApi } from "../api/auth";
import { statusConfig } from "../utils/helpers";
import {
  Menu,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  ListTodo,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const COLUMNS = ["todo", "in-progress", "review", "done"];

const Dashboard = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [view, setView] = useState("kanban");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assignedTo = assigneeFilter;

      const [tasksRes, usersRes, statsRes] = await Promise.all([
        getTasksApi(params),
        getAllUsersApi(),
        getStatsApi(),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter, assigneeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskApi(draggableId, { status: newStatus });
      const statsRes = await getStatsApi();
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to update task status", error);
      fetchData();
    }
  };

  const handleSaveTask = async (payload, taskId) => {
    try {
      if (taskId) {
        await updateTaskApi(taskId, payload);
      } else {
        await createTaskApi(payload);
      }
      await fetchData();
      setModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTaskApi(taskId);
      await fetchData();
      setModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      const res = await addCommentApi(taskId, text);
      setSelectedTask(res.data);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-slate-500" onClick={() => setMobileOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                  Welcome back, {user?.name?.split(" ")[0]} 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">Here's what's happening with your tasks</p>
              </div>
            </div>
            <button
              onClick={openNewTaskModal}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-lg shadow-violet-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Tasks" value={stats.total || 0} icon={ListTodo} color={{ bg: "bg-violet-50", text: "text-violet-600" }} />
            <StatCard label="In Progress" value={stats.inProgress || 0} icon={Clock} color={{ bg: "bg-blue-50", text: "text-blue-600" }} />
            <StatCard label="In Review" value={stats.review || 0} icon={Eye} color={{ bg: "bg-amber-50", text: "text-amber-600" }} />
            <StatCard label="Completed" value={stats.done || 0} icon={CheckCircle2} color={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
            <StatCard label="Overdue" value={stats.overdue || 0} icon={AlertTriangle} color={{ bg: "bg-red-50", text: "text-red-600" }} />
          </div>

          {/* Charts */}
          <DashboardCharts stats={stats} />

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-violet-500 outline-none text-sm transition bg-white"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-violet-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-violet-500"
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            <div className="flex bg-white border border-slate-200 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setView("kanban")}
                className={`p-1.5 rounded-lg transition ${view === "kanban" ? "bg-violet-100 text-violet-600" : "text-slate-400"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-lg transition ${view === "list" ? "bg-violet-100 text-violet-600" : "text-slate-400"}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : view === "kanban" ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMNS.map((col) => (
                  <Droppable droppableId={col} key={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-slate-100/60 rounded-2xl p-3 min-h-[200px] transition ${
                          snapshot.isDraggingOver ? "bg-violet-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 px-1 mb-3">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusConfig[col].color }}
                          ></span>
                          <h3 className="text-sm font-semibold text-slate-600">{statusConfig[col].label}</h3>
                          <span className="text-xs text-slate-400 bg-white px-1.5 py-0.5 rounded-md">
                            {tasksByStatus(col).length}
                          </span>
                        </div>
                        {tasksByStatus(col).map((task, index) => (
                          <TaskCard key={task._id} task={task} index={index} onClick={openTaskModal} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-400">
                    <th className="px-4 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Priority</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Assignees</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => openTaskModal(task)}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{task.title}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${statusConfig[task.status].color}20`,
                            color: statusConfig[task.status].color,
                          }}
                        >
                          {statusConfig[task.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize hidden md:table-cell text-slate-500">{task.priority}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex -space-x-2">
                          {task.assignedTo?.map((u) => (
                            <Avatar key={u._id} user={u} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tasks.length === 0 && (
                <p className="text-center text-slate-400 py-10 text-sm">No tasks found.</p>
              )}
            </div>
          )}
        </main>
      </div>

      {modalOpen && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => {
            setModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default Dashboard;