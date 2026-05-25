import { LayoutDashboard, SquareLibrary, Users } from "lucide-react";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  {
    to: "dashboard-v2",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "course",
    label: "Courses",
    icon: SquareLibrary,
  },
  {
    to: "students",
    label: "Students",
    icon: Users,
  },
];

const Sidebar = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full border-b border-gray-300 p-4 dark:border-gray-700 lg:sticky lg:top-0 lg:h-screen lg:w-[250px] lg:border-b-0 lg:border-r lg:p-5 sm:lg:w-[300px]">
        <div className="flex flex-wrap gap-2 lg:flex-col lg:space-y-2 lg:gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={20} />
                <h1>{item.label}</h1>
              </NavLink>
            );
          })}
        </div>
      </div>
    <div className="flex-1 p-5 lg:p-10">
        <Outlet/>
      </div>
    </div>
  );
};

export default Sidebar;
