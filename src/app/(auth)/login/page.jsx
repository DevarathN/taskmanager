"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiEyeLine } from "react-icons/ri";
import { RiEyeOffLine } from "react-icons/ri";
import "./login.css";
import { supabase } from "@/lib/supabaseClient";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      // only redirect if a valid session exists
      if (data.session) {
        router.push("/dashboard");
      }
    };

    getSession();

    // also watch for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.push("/dashboard");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log("User not logged in");
      return alert(error.message);
    }
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // redirect after login
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src="/images/login-signup-hero.jpg" alt="" />
      </div>
      <div className="login-form">
        <p style={{ fontSize: "30px" }}>Welcome to GGTodo</p>
        <p style={{ color: "grey" }}>To get started, please sign in</p>
        <button onClick={handleGoogle} className="google-authentication login">
          <img src="/images/google.png" alt="login-with-google" />
          Login with Google
        </button>
        <div style={{ display: "flex", gap: "10px" }}>
          <hr style={{ width: "130px", border: "1px solid lightgrey" }} />
          Or
          <hr style={{ width: "130px", border: "1px solid lightgrey" }} />
        </div>
        <div className="form-field ">
          <label htmlFor="email">
            Email<span className="required">*</span>
          </label>
          <div className="email-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              required
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="password">
            Password<span className="required">*</span>
          </label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
              className="show-hide-password-icon"
              style={{ color: "grey" }}
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </i>
          </div>
        </div>

        <button onClick={handleLogin} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
}
