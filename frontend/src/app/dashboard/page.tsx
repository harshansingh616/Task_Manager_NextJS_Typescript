"use client";

import TasksDashboard from "@/components/TasksDashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <div className="container py-5">Loading...</div>;
  if (!user) return <div className="container py-5">Redirecting...</div>;

  return (
    <>
      <nav className="navbar navbar-expand-lg tm-navbar border-bottom border-dark" data-bs-theme="dark">
        <div className="container">
          <span className="navbar-brand">Task Manager</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">Logged in as: {user.email}</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <TasksDashboard />
    </>
  );
}