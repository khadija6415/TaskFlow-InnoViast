export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const isOverdue = (deadline, status) => {
  if (!deadline || status === "done") return false;
  return new Date(deadline) < new Date();
};

export const priorityStyles = {
  high: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", border: "border-red-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", border: "border-amber-200" },
  low: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-200" },
};

export const statusConfig = {
  todo: { label: "To Do", color: "#94A3B8" },
  "in-progress": { label: "In Progress", color: "#3B82F6" },
  review: { label: "Review", color: "#F59E0B" },
  done: { label: "Done", color: "#10B981" },
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};