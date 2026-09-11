"use client";

import { FormEvent, useState } from "react";
import { AdminApiError, adminFetch } from "../admin-client";

function safeReturnTo(value: string): string {
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  return value;
}

export function AdminLoginForm({ returnTo }: { returnTo: string }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await adminFetch<{ admin: unknown; expiresAt: string }>("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginName, password }),
      });
      window.location.assign(safeReturnTo(returnTo));
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Không thể đăng nhập lúc này.");
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit} noValidate>
      <div className="admin-field">
        <label htmlFor="admin-login-name">Tên đăng nhập</label>
        <input id="admin-login-name" name="loginName" autoComplete="username" value={loginName} onChange={(event) => setLoginName(event.target.value)} required maxLength={100} />
      </div>
      <div className="admin-field">
        <label htmlFor="admin-password">Mật khẩu</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={200} />
      </div>
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <button className="admin-primary-button" type="submit" disabled={submitting || !loginName || !password}>
        {submitting ? "Đang kiểm tra…" : "Đăng nhập an toàn"}
      </button>
      <p className="admin-login-note">Phiên đăng nhập hết hạn sau 8 giờ. Hệ thống sẽ tạm khóa khi thử sai nhiều lần.</p>
    </form>
  );
}
