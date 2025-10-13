"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./sidebar.css";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    // Close dropdown if clicked outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const links =
    role === "superuser"
      ? [
          { name: "Todos", path: "/dashboard/todos" },
          { name: "Users", path: "/dashboard/users" },
        ]
      : [{ name: "Todos", path: "/dashboard/todos" }];

  return (
    <div>
      <nav className="nav-container">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={
              pathname === link.path
                ? "font-bold text-blue-600"
                : "text-gray-700"
            }
          >
            {link.name}
          </Link>
        ))}

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className={`flex items-center gap-2 mt-2 px-2 py-1 rounded hover:bg-gray-100 ${
              pathname.includes("/dashboard/profile")
                ? "font-bold text-blue-600"
                : "text-gray-700"
            }`}
            style={{
              border: "none",
              borderRadius: "50%",
              backgroundColor: "white",
            }}
          >
            <img
              src="/images/man.png"
              alt="Profile"
              className="w-5 h-5 rounded-full"
            />
          </button>

          {open && (
            <div className="profile-dropdown">
              <div>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
              </div>
              <div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
