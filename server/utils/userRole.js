import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

const getInstructorEmailAllowlist = () =>
  (process.env.INSTRUCTOR_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const resolveLmsRole = (user, { isCourseCreator = false } = {}) => {
  if (!user) {
    return "student";
  }

  const directRole = String(user.lmsrole || "").trim().toLowerCase();
  if (directRole === "instructor" || directRole === "student") {
    return directRole;
  }

  const legacyRole = String(user.role || "").trim().toLowerCase();
  if (legacyRole === "instructor" || legacyRole === "student") {
    return legacyRole;
  }

  const email = String(user.email || "").trim().toLowerCase();
  if (email && getInstructorEmailAllowlist().includes(email)) {
    return "instructor";
  }

  if (isCourseCreator) {
    return "instructor";
  }

  return "student";
};

export const sanitizeAuthUser = async (user) => {
  if (!user) {
    return null;
  }

  const userObject = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObject.password;

  const userId = userObject._id || user._id;
  const isCourseCreator = userId
    ? await Course.exists({ creator: userId })
    : false;
  const resolvedRole = resolveLmsRole(userObject, { isCourseCreator: Boolean(isCourseCreator) });

  if (userId && user.lmsrole !== resolvedRole) {
    await User.findByIdAndUpdate(userId, { lmsrole: resolvedRole }, { runValidators: true });
  }

  return {
    ...userObject,
    lmsrole: resolvedRole,
  };
};
