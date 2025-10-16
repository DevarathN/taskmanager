"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import "./signup.css";
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSignup = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullname },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.log("error");
        throw error;
      }

      alert("Signup successful! Please check your email.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      alert(error.message);
    }
  };
  return (
    <div className="signup-container">
      <div className="signup-image">
        <img src="/images/login-signup-hero.jpg" alt="" />
      </div>
      <div className="signup-form">
        <h3>GREEDYGAME</h3>
        <p style={{ fontSize: "30px" }}>
          You’re one click away from less busywork
        </p>
        <p style={{ color: "grey" }}>To get started, please sign in</p>
        <button onClick={handleGoogle} className="google-authentication signup">
          <img src="/images/google.png" alt="signup-with-google" />
          Signup with Google
        </button>
        <div className="form-field ">
          <label htmlFor="fullname">
            Full Name<span className="required">*</span>
          </label>
          <div className="fullname-wrapper">
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              name="fullname"
              required
            />
          </div>
        </div>

        <div className="form-field">
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
            >
              {showPassword ? (
                <img src="/images/password-hide.png" />
              ) : (
                <img src="/images/password-show.png" />
              )}
            </i>
          </div>
        </div>
        <button onClick={handleSignup} className="signup-btn">
          Get Started
        </button>
      </div>
    </div>
  );
}
