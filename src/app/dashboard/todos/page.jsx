"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CiEdit } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import TodoForm from "./todoform";
import "./page.css";
export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile + todos
  const fetchTodos = async (userId) => {
    setLoading(true);

    // 1️⃣ Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileError) {
      console.error(profileError);
      setLoading(false);
      return;
    }

    setCurrentUser(profile);

    // 2️⃣ Fetch user's todos
    const { data: todosData, error: todosError } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("due_at", { ascending: true });

    if (todosError) {
      console.error(todosError);
      setLoading(false);
      return;
    }

    setTodos(todosData);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user) fetchTodos(user.id);
    });

    // Listen for future auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const user = session?.user;
        if (user) fetchTodos(user.id);
        else setCurrentUser(null); // logged out
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) return alert(error.message);
    if (currentUser) fetchTodos(currentUser.id);
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (!currentUser)
    return <p className="text-center mt-4">No user logged in</p>;

  return (
    <div>
      <h1 className="text-2xl mb-4">Todos</h1>

      <h3 className="mb-4">
        Hello <strong>{currentUser.name || "User"}</strong>
      </h3>

      <div className="task-overview">
        <div className="total-tasks">
          <h3>All ToDos</h3>
          <span>{todos.length}</span>
        </div>
        <div className="upcoming-tasks">
          <h3>Upcoming</h3>
          <span>{todos.filter((item) => !item.completed).length}</span>
        </div>
        <div className="completed-tasks">
          <h3>Completed</h3>
          <span>{todos.filter((item) => item.completed).length}</span>
        </div>
      </div>
      <div className="title-add-todo">
        <TodoForm
          fetchTodos={() => fetchTodos(currentUser.id)}
          editing={editing}
          setEditing={setEditing}
        />
        {todos.length > 0 && (
          <table className="todo-list">
            <thead>
              <tr>
                <th>ToDo</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todos.map((todo) => (
                <tr key={todo.id} className="border-black">
                  <td>
                    <strong>{todo.title}</strong>
                    <p style={{ color: "grey", fontSize: "small" }}>
                      {todo.description}
                    </p>
                  </td>
                  <td className="text-sm">
                    {new Date(todo.due_at).toLocaleString([], {
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                    })}
                  </td>

                  <td>
                    <span
                      className={`font-semibold ${
                        todo.completed ? "status-completed" : "status-upcoming"
                      }`}
                    >
                      {todo.completed ? "Completed" : "Upcoming"}
                    </span>
                  </td>
                  <td>
                    <div className="edit-delete-view">
                      <button
                        onClick={() => {
                          if (editing && editing.id === todo.id)
                            setEditing(null);
                          else setEditing(todo);
                        }}
                      >
                        <CiEdit className="edit-icon" />
                      </button>
                      <button onClick={() => handleDelete(todo.id)}>
                        <GoTrash className="delete-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
