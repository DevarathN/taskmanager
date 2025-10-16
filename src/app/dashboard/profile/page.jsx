"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import "./profile.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: "",
    created_at: "",
    role: "",
  });
  const [todos, setTodos] = useState([]);
  const router = useRouter();

  // 🧭 Go back to dashboard
  const handleClose = () => {
    router.push("/dashboard");
  };

  // 🧩 Fetch profile and todos
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("name, email, avatar_url, created_at, role")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch user's todos
      const { data: todosData, error: todosError } = await supabase
        .from("todos")
        .select("id, title, completed, due_at")
        .eq("user_id", userId)
        .order("due_at", { ascending: true });

      if (todosError) {
        console.error("Error fetching todos:", todosError);
        return;
      }

      setProfile({
        name: userData.name || "",
        email: userData.email || session.user.email, // fallback to auth email
        avatar_url: userData.avatar_url || "",
        created_at: userData.created_at,
        role: userData.role,
      });

      setTodos(todosData || []);
    };

    fetchProfile();
  }, []);

  // 🧩 Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return alert("Not logged in");

    const { error } = await supabase
      .from("users")
      .update({
        name: profile.name,
        avatar_url: profile.avatar_url,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error updating profile:", error);
      alert("Update failed!");
    } else {
      alert("Profile updated!");
    }
  };

  return (
    <div>
      <form onSubmit={handleUpdate} className="profile-view-update">
        {/* Header */}

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:opacity-70"
          >
            <IoMdClose style={{ fontSize: "20px" }} />
          </button>
        </div>

        {/* Fields */}
        <span className="status-upcoming" style={{ width: "10%" }}>
          {profile.role}
        </span>
        <p style={{ fontSize: "small", color: "gray" }}>
          Joined on:
          {new Date(profile.created_at).toLocaleDateString([], {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <label htmlFor="name">
          Name<span className="required">*</span>
        </label>
        <input
          type="text"
          placeholder="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="p-2 border rounded mb-2"
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={profile.email}
          disabled
          className="p-2 border rounded mb-2 bg-gray-100 cursor-not-allowed"
        />

        <label htmlFor="avatar_url">Avatar URL</label>
        <input
          type="text"
          placeholder="Avatar URL"
          value={profile.avatar_url}
          onChange={(e) =>
            setProfile({ ...profile, avatar_url: e.target.value })
          }
          className="p-2 border rounded mb-4"
        />

        <button type="submit" className="update-profile-btn">
          Update Profile
        </button>
        <hr />
        {todos.length > 0 && (
          <div className="task-runthrough">
            <div className="total-tasks">
              <p>All ToDos</p>
              <p>{todos.length}</p>
            </div>
            <div className="upcoming-tasks">
              <p>Upcoming</p>
              <p>{todos.filter((item) => !item.completed).length}</p>
            </div>
            <div className="completed-tasks">
              <p>Completed</p>
              <p>{todos.filter((item) => item.completed).length}</p>
            </div>
          </div>
        )}
      </form>

      {/* Optional Todos Summary */}
    </div>
  );
}
