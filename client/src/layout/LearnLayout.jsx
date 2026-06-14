import React from "react";
import { Outlet } from "react-router-dom";
import LearnHeader from "@/components/LearnHeader";

const LearnLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <LearnHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default LearnLayout;
