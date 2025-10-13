"use client";

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome to TaskFlow Dashboard</h1>
      <p className="text-gray-700">
        Use the sidebar to navigate through your tasks, profile, and user
        management (if you are a superuser).
      </p>
    </div>
  );
}
