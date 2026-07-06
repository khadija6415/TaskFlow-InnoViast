import { Draggable } from "@hello-pangea/dnd";
import { MessageSquare, Calendar } from "lucide-react";
import Avatar from "./Avatar";
import { formatDate, isOverdue, priorityStyles } from "../utils/helpers";

const TaskCard = ({ task, index, onClick }) => {
  const overdue = isOverdue(task.deadline, task.status);
  const pStyle = priorityStyles[task.priority];

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white rounded-xl p-4 mb-3 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition ${
            snapshot.isDragging ? "rotate-2 shadow-lg" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pStyle.bg} ${pStyle.text}`}>
              {task.priority.toUpperCase()}
            </span>
            {task.labels?.[0] && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {task.labels[0]}
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex -space-x-2">
              {task.assignedTo?.slice(0, 3).map((u) => (
                <Avatar key={u._id} user={u} size="sm" />
              ))}
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              {task.comments?.length > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {task.comments.length}
                </span>
              )}
              {task.deadline && (
                <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-500 font-medium" : ""}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(task.deadline)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;