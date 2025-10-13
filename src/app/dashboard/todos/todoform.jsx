"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TodoForm({ fetchTodos, editing, setEditing }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [completed, setCompleted] = useState(false); // 🆕 use boolean
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (editing) {
      setFormOpen(true);
      setTitle(editing.title);
      setDescription(editing.description);
      setDueAt(editing.due_at?.slice(0, 16) || "");
      setCompleted(editing.completed || false);
    } else {
      setFormOpen(false);
      setTitle("");
      setDescription("");
      setDueAt("");
      setCompleted(false);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user);

    if (!user) return alert("User not logged in");
    if (new Date(dueAt) <= new Date())
      return alert("Due date must be in the future");

    if (editing) {
      await supabase
        .from("todos")
        .update({ title, description, due_at: dueAt, completed })
        .eq("id", editing.id);
      setEditing(null);
    } else {
      // 🆕 New todos default to completed = false (Upcoming)
      await supabase.from("todos").insert({
        user_id: user.id,
        title,
        description,
        due_at: dueAt,
        completed: false,
      });
    }

    fetchTodos();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p>
          <strong>All Todos</strong>
        </p>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            gap: "10px",
            border: "none",
            borderRadius: "5px",
            background: "#0CAF60",
            color: "white",
          }}
          onClick={() => {
            setFormOpen((prev) => {
              const next = !prev;
              if (!next) setEditing(null);
              return next;
            });
          }}
        >
          {formOpen ? "Close" : editing ? "Edit Todo" : "Add Todo"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="todo-form">
          <h2>{editing ? "Edit Todo" : "Add Todo"}</h2>
          <label htmlFor="title">
            Title<span className="required">*</span>
          </label>
          <input
            placeholder="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <label htmlFor="title">
            Description<span className="required">*</span>
          </label>
          <input
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded"
          />
          <label htmlFor="datetime">
            Datetime<span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            name="datetime"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="p-2 border rounded"
            required
          />

          {/* 🆕 Completed toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            <span>{completed ? "Completed" : "Upcoming"}</span>
          </label>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded"
            >
              {editing ? "Update" : "Add"} Todo
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="bg-gray-400 text-white p-2 rounded"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="bg-gray-400 text-white p-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
