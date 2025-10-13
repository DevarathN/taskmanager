"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);

  // 🧩 Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching users:", error);
    else setUsers(data || []);
    setLoading(false);
  };

  // 🔄 Toggle role
  const toggleRole = async (userId, currentRole) => {
    setLoadingUserId(userId);
    const newRole = currentRole === "superuser" ? "user" : "superuser";

    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    setLoadingUserId(null);
    if (error) alert("Error updating role: " + error.message);
    else fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading users...</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">
        User Management
      </h2>

      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left border-b">Name</th>
            <th className="p-2 text-left border-b">Email</th>
            <th className="p-2 text-left border-b">Role</th>
            <th className="p-2 text-left border-b">Toggle Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={`hover:bg-gray-50 transition ${
                user.role === "superuser" ? "bg-yellow-50" : ""
              }`}
            >
              <td className="p-2 border-b">{user.name || "—"}</td>
              <td className="p-2 border-b">{user.email}</td>
              <td className="p-2 border-b capitalize">{user.role}</td>

              <td className="p-2 border-b">
                <button
                  onClick={() => toggleRole(user.id, user.role)}
                  disabled={loadingUserId === user.id}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                    user.role === "superuser" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      user.role === "superuser"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No users found.</p>
      )}
    </div>
  );
}
