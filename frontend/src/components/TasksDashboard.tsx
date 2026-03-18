"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  data: Task[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type Toast = {
  id: string;
  title: string;
  message: string;
  variant: "success" | "danger" | "info";
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function TasksDashboard() {
  // list state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<ListResponse["meta"] | null>(null);

  // filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<"" | "pending" | "completed">("");
  const [search, setSearch] = useState("");

  // create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // edit modal state
  const [isEditOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Record<string, number>>({});

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (status) p.set("status", status);
    if (search.trim()) p.set("search", search.trim());
    return `?${p.toString()}`;
  }, [page, limit, status, search]);

  function pushToast(t: Omit<Toast, "id">, ttlMs = 2500) {
    const id = uid();
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev]);

    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      delete toastTimers.current[id];
    }, ttlMs);

    toastTimers.current[id] = timer;
  }

  function dismissToast(id: string) {
    const timer = toastTimers.current[id];
    if (timer) window.clearTimeout(timer);
    delete toastTimers.current[id];
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  async function load() {
    const res = await apiFetch<ListResponse>(`/tasks${query}`);
    setTasks(res.data);
    setMeta(res.meta);
  }

  useEffect(() => {
    load().catch((e) => pushToast({ title: "Error", message: e.message ?? "Failed to load tasks", variant: "danger" }));
    
  }, [query]);

  async function createTask() {
    const newTask = await apiFetch<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description: description || undefined }),
    });

    setTitle("");
    setDescription("");
    pushToast({ title: "Created", message: "Task added successfully", variant: "success" });

    
    setTasks((prev) => [newTask, ...prev]);
    setMeta((m) => (m ? { ...m, total: m.total + 1 } : m));
  }

  async function toggleTask(id: string) {
    const updated = await apiFetch<Task>(`/tasks/${id}/toggle`, { method: "POST" });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    pushToast({
      title: "Updated",
      message: updated.completed ? "Marked as completed" : "Marked as pending",
      variant: "info",
    });
  }

  async function deleteTask(id: string) {
    await apiFetch<void>(`/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setMeta((m) => (m ? { ...m, total: Math.max(0, m.total - 1) } : m));
    pushToast({ title: "Deleted", message: "Task deleted successfully", variant: "success" });
  }

  function openEditModal(task: Task) {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditOpen(true);
  }

  function closeEditModal() {
    setEditOpen(false);
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit() {
    if (!editId) return;

    const updated = await apiFetch<Task>(`/tasks/${editId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() ? editDescription.trim() : undefined,
      }),
    });

    setTasks((prev) => prev.map((t) => (t.id === editId ? updated : t)));
    pushToast({ title: "Saved", message: "Task updated successfully", variant: "success" });
    closeEditModal();
  }

  return (
    <div className="container py-4">
      {/* Toasts */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 2000, width: 360 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div key={t.id} className="toast show mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">{t.title}</strong>
              <button type="button" className="btn-close" onClick={() => dismissToast(t.id)} />
            </div>
            <div
              className={
                "toast-body " +
                (t.variant === "success" ? "text-success" : t.variant === "danger" ? "text-danger" : "text-info")
              }
            >
              {t.message}
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Left: Create + Filters */}
        <div className="col-12 col-lg-4">
          <div className="card tm-card">
            <div className="card-body">
              <h5 className="card-title">Create Task</h5>

              <div className="mb-2">
                <label className="form-label">Title</label>
                <input className="form-control tm-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control tm-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary w-100"
                onClick={() =>
                  createTask().catch((e) =>
                    pushToast({ title: "Error", message: e.message ?? "Create failed", variant: "danger" })
                  )
                }
                disabled={!title.trim()}
              >
                Add
              </button>
            </div>
          </div>

          <div className="card tm-card mt-3">
            <div className="card-body">
              <h5 className="card-title">Filters</h5>

              <div className="mb-2">
                <label className="form-label">Search title</label>
                <input className="form-control tm-input" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div className="mb-2">
                <label className="form-label">Status</label>
                <select className="form-select tm-input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                className="btn btn-outline-light w-100"
                onClick={() => {
                  setPage(1);
                  pushToast({ title: "Filters", message: "Filters applied (page 1)", variant: "info" }, 1400);
                }}
              >
                Apply (page 1)
              </button>
            </div>
          </div>
        </div>

        {/* Right: List */}
        <div className="col-12 col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Tasks</h4>
            {meta && (
              <small className="text-muted">
                Total: {meta.total} • Page {meta.page}/{meta.totalPages || 1}
              </small>
            )}
          </div>

          <div className="list-group">
            {tasks.map((t) => (
              <div key={t.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input mt-1"
                        checked={t.completed}
                        onChange={() =>
                          toggleTask(t.id).catch((e) =>
                            pushToast({ title: "Error", message: e.message ?? "Toggle failed", variant: "danger" })
                          )
                        }
                      />
                      <strong className={t.completed ? "text-decoration-line-through text-muted" : ""}>{t.title}</strong>
                    </div>

                    {t.description && <div className="text-muted mt-1">{t.description}</div>}
                  </div>

                  <div className="btn-group">
                    <button className="btn btn-sm btn-info" onClick={() => openEditModal(t)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        deleteTask(t.id).catch((e) =>
                          pushToast({ title: "Error", message: e.message ?? "Delete failed", variant: "danger" })
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tasks.length === 0 && <div className="list-group-item text-muted">No tasks found.</div>}
          </div>

          <div className="d-flex justify-content-between mt-3">
            <button className="btn btn-outline-light" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <button
              className="btn btn-outline-light"
              disabled={meta ? page >= meta.totalPages : true}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      
      {isEditOpen && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content tm-card">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Task</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeEditModal} />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      className="form-control tm-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control tm-input"
                      rows={4}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-light" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!editTitle.trim()}
                    onClick={() =>
                      saveEdit().catch((e) =>
                        pushToast({ title: "Error", message: e.message ?? "Update failed", variant: "danger" })
                      )
                    }
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" onClick={closeEditModal} />
        </>
      )}
    </div>
  );
}