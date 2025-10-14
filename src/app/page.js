"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/");
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to TaskFlow</h1>
      <p className="mb-4">Organize your tasks and manage roles efficiently.</p>
      <div className="login-signup">
        <button
          onClick={() => router.push("/login")}
          className="login-redirect"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="signup-redirect"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
