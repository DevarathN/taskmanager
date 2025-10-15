"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { RiArrowUpDownLine } from "react-icons/ri";

import "./usertable.css";
export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  // 🧩 Fetch users
  const router = useRouter();
  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(9px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(12px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#0CAF60",
          ...theme.applyStyles("dark", {
            backgroundColor: "#0CAF60",
          }),
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(["width"], {
        duration: 200,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor: "rgba(0,0,0,.25)",
      boxSizing: "border-box",
      ...theme.applyStyles("dark", {
        backgroundColor: "rgba(255,255,255,.35)",
      }),
    },
  }));
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
  const fetchCurrentUserRole = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (error) console.error("Error fetching role:", error);
    else setCurrentUserRole(data.role);
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
    if (error) {
      alert("Error updating role: " + error.message);
      return;
    }

    // ✅ Refetch current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // ✅ If the logged-in user changed their own role,
    // re-fetch their updated role from the database
    if (session?.user.id === userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role === "user") {
        // Update local UI state instantly (hide table)
        setUsers([]); // Clear table
        alert(
          "Your role has been changed to 'user'. You now have limited access."
        );
        router.push("/login");
      }
    }

    // ✅ Otherwise just refresh user list
    fetchUsers();
  };

  useEffect(() => {
    fetchCurrentUserRole();
    fetchUsers();
  }, [currentUserRole]);

  if (loading) return <p className="text-center mt-4">Loading users...</p>;
  if (currentUserRole !== "superuser") {
    return;
  }
  return (
    <div className="">
      <table className="usertable">
        <thead className="">
          <tr>
            <th className="">Name</th>

            <th
              className=""
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              Role <RiArrowUpDownLine />
            </th>
            <th className="">Actions</th>
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
              <td className="">
                {user.name || "—"}
                <p>{user.email}</p>
              </td>

              <td className="">
                {user.role === "user" ? "Viewer" : "Super admin"}
              </td>

              <td className="">
                <div>
                  <FormControlLabel
                    control={
                      <AntSwitch
                        checked={user.role === "superuser"}
                        onChange={() => toggleRole(user.id, user.role)}
                        disabled={loadingUserId === user.id}
                      />
                    }
                  />
                </div>
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
