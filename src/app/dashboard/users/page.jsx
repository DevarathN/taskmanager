"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import UserTable from "@/components/UserTable";

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  // ✅ Check logged-in user and their role
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      const { data, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError) {
        console.error("Error fetching role:", roleError.message);
        router.push("/dashboard");
        return;
      }

      setRole(data.role);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">Checking access...</p>
    );
  }

  // 🚫 Restrict access if not superuser
  if (role !== "superuser") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  // ✅ Show User Management Table
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserTable />
    </div>
  );
}
