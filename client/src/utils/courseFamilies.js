const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const getCourseFamilyKey = (categoryValue) => {
  const normalizedCategory = normalizeText(categoryValue);

  if (!normalizedCategory) {
    return "general";
  }

  if (
    [
      "compliance",
      "data privacy",
      "integrity",
      "ethics",
      "hsce",
      "karin",
      "mpd",
    ].some((term) => normalizedCategory.includes(term))
  ) {
    return "compliance_governance";
  }

  if (
    ["ciberseguridad", "cybersecurity", "security", "riesgo", "risk"].some((term) =>
      normalizedCategory.includes(term)
    )
  ) {
    return "security_risk";
  }

  if (
    [
      "tecnologia",
      "technology",
      "ia",
      "ai",
      "mern",
      "mongodb",
      "javascript",
      "python",
      "docker",
      "fullstack",
      "frontend",
      "backend",
      "html",
      "next",
      "desarrollo",
    ].some((term) => normalizedCategory.includes(term))
  ) {
    return "technology_innovation";
  }

  if (
    [
      "operacional",
      "operational",
      "continuidad",
      "continuity",
      "safety",
      "mineria",
      "mining",
    ].some((term) => normalizedCategory.includes(term))
  ) {
    return "operations_continuity";
  }

  if (
    ["salud", "health", "wellbeing", "bienestar"].some((term) =>
      normalizedCategory.includes(term)
    )
  ) {
    return "health_wellbeing";
  }

  return "general";
};

export const groupCoursesByFamily = (courses = [], t) => {
  const groupsMap = new Map();

  courses.forEach((course) => {
    const familyKey = getCourseFamilyKey(course?.courseCategory);
    if (!groupsMap.has(familyKey)) {
      groupsMap.set(familyKey, []);
    }
    groupsMap.get(familyKey).push(course);
  });

  return Array.from(groupsMap.entries()).map(([familyKey, familyCourses]) => ({
    familyKey,
    familyTitle: t(`home.course_family_${familyKey}`),
    courses: familyCourses,
  }));
};