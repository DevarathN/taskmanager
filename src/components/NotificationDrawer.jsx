"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./notification.css";
export default function NotificationDrawer() {
  const [todos, setTodos] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchTodos = async () => {
    const user = await supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user);
    if (!user) {
      console.log("User not found");
      return;
    }
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id);

    if (!data) {
      console.log("data not found");
      return;
    }
    const now = new Date();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, [todos]);

  return (
    <div>
      <button className="noti-btn" onClick={() => setOpen((prev) => !prev)}>
        {open ? (
          <i>
            <img src="/images/ringing.png" alt="" srcset="" />
          </i>
        ) : (
          <i>
            <img src="/images/notification.png" alt="" srcset="" />
          </i>
        )}
      </button>
      {open ? (
        <>
          <div className="notification-container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 className="text-xl mb-2">All Notifications</h2>
              <i
                style={{ fontSize: "12px", height: "12px" }}
                onClick={() => setOpen(false)}
              >
                <img src="/images/close.png" alt="" srcset="" />
              </i>
            </div>

            {todos.map((t) => (
              <div key={t.id} className="notification">
                <div className="title-status">
                  <p>{t.title}</p>
                  <span
                    className={`${
                      t.completed ? "status-completed" : "status-upcoming"
                    }`}
                  >
                    {t.completed ? "Completed" : "Upcoming"}
                  </span>
                </div>
                <p className="description">{t.description}</p>
                <p className="datetime">
                  {new Date(t.due_at).toLocaleDateString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
