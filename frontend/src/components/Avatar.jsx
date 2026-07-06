import { getInitials } from "../utils/helpers";

const Avatar = ({ user, size = "md" }) => {
  const sizes = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  if (!user) return null;

  return (
    <div
      title={user.name}
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white shrink-0`}
      style={{ backgroundColor: user.avatarColor || "#7C3AED" }}
    >
      {getInitials(user.name)}
    </div>
  );
};

export default Avatar;