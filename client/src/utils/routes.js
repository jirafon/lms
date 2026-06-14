import { isInstructor } from "./userRole";

export const ROUTES = {
  home: "/",
  catalog: "/catalog",
  app: "/app",
  appProfile: "/app/profile",
  studio: "/studio",
  login: "/login",
  profile: "/app/profile",
  course: (courseId) => `/courses/${courseId}`,
  courseLearn: (courseId) => `/app/learn/${courseId}`,
  courseProgress: (courseId) => `/app/learn/${courseId}`,
  catalogSearch: (query) =>
    query ? `/catalog?query=${encodeURIComponent(query)}` : "/catalog",
};

export const getHomePath = (user) =>
  isInstructor(user) ? ROUTES.studio : ROUTES.app;
