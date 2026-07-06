import { useState, useEffect } from "react";
import { X, Trash2, Send, Loader2 } from "lucide-react";
import Avatar from "./Avatar";
import { formatDate } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const TaskModal = ({ task, users, onClose, onSave, onDelete, onAddComment }) => {
  const { user: currentUser } = useAuth();
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [status, setStatus] = useState(task?.status || "todo");
  const [deadline, setDeadline] = useState(task?.deadline ? task.deadline.split("T")[0] : "");
  const [labelsInput, setLabelsInput] = useState(task?.labels?.join(", ") || "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?.map((u) => u._id) || []);
  const [commentText, setCommentText] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const toggleAssignee = (id) => {
    setAssignedTo((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      description,
      priority,
      status,
      deadline: deadline || null,
      labels: labelsInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      assignedTo,
    };
    await onSave(payload, task?._id);
    setSaving(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    await onAddComment(task._id, commentText);
    setCommentText("");
    setCommentLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design landing page"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 outline-none transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 outline-none transition"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Labels (comma separated)</label>
              <input
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="Design, Frontend"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign to</label>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  type="button"
                  key={u._id}
                  onClick={() => toggleAssignee(u._id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition ${
                    assignedTo.includes(u._id)
                      ? "bg-violet-50 border-violet-300 text-violet-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Avatar user={u} size="sm" />
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-violet-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Save Changes" : "Create Task"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => onDelete(task._id)}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {isEdit && (
          <div className="px-6 pb-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Comments</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {task.comments?.length === 0 && (
                <p className="text-xs text-slate-400">No comments yet.</p>
              )}
              {task.comments?.map((c, i) => (
                <div key={i} className="flex gap-2.5">
                  <Avatar user={c.author} size="sm" />
                  <div className="bg-slate-50 rounded-xl px-3 py-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{c.author?.name}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Avatar user={currentUser} size="sm" />
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-violet-500 outline-none text-sm transition"
              />
              <button
                type="submit"
                disabled={commentLoading}
                className="px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition"
              >
                {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;