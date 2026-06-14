export const getUserRole = (user) => {
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

  return "student";
};

export const isInstructor = (user) => getUserRole(user) === "instructor";
