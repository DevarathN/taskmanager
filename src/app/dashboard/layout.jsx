"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import NavLinks from "@/components/NavLinks";
import { useRouter } from "next/navigation";
import NotificationDrawer from "@/components/NotificationDrawer";
import SuperuserSidebar from "@/components/SuperUserSidebar";
import "./layout.css";
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else {
        setUser(data.session.user);
        supabase
          .from("users")
          .select("role")
          .eq("id", data.session.user.id)
          .single()
          .then(({ data: profile }) => profile && setRole(profile.role));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.push("/login");
        else setUser(session.user);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, [role]);

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex" }}>
      <div>{role === "superuser" ? <SuperuserSidebar /> : ""}</div>
      <div style={{ width: "100%" }}>
        <div className="nav-bar">
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <h4>GREEDYGAME</h4>
          </div>

          <div className="noti-sidebar">
            <NotificationDrawer />
            <NavLinks role={role} />
          </div>
        </div>

        <main
          className="flex-1 p4"
          style={{ background: "#FAFAFA", padding: "20px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
