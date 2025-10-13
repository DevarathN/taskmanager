"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./superusersidebar.css";

export default function SuperuserSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState("user"); // default to normal user

  // Fetch current user role
  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!error && data) setRole(data.role);
    };
    fetchRole();
  }, []);

  // Only render for superusers
  if (role !== "superuser") return null;

  const navItemClass = (path) =>
    pathname === path ? "font-bold text-blue-600" : "text-gray-700";

  return (
    <nav className="superuser-nav-container">
      <Link href="/dashboard" className={navItemClass("/dashboard")}>
        Dashboard
      </Link>
      <Link
        href="/dashboard/users"
        className={navItemClass("/dashboard/users")}
      >
        Users
      </Link>
    </nav>
  );
}
