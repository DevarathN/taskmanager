"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BsGridFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi";

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

  return (
    <div className="superuser-nav-container">
      <div>
        <span>
          <BsGridFill />
        </span>
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <div>
        <span>
          <HiUsers />
        </span>
        <Link href="/dashboard/users">Users</Link>
      </div>
    </div>
  );
}
