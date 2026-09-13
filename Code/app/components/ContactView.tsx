"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ContactValues = { fullName: string; contact: string; subject: string; message: string };
type ContactErrors = Partial<Record<keyof ContactValues, string>>;
type StoreInfo = { configured: boolean; address: string | null; mapsUrl: string | null };

const initialValues: ContactValues = { fullName: "", contact: "", subject: "", message: "" };

export function ContactView({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [store, setStore] = useState<StoreInfo | null>(null);
  const requestId = useRef(crypto.randomUUID());
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store-info", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("store info unavailable")))
      .then((payload: { store: StoreInfo }) => setStore(payload.store))
      .catch(() => { if (!controller.signal.aborted) setStore({ configured: false, address: null, mapsUrl: null }); });
    return () => controller.abort();
  }, []);

  function update(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "sending") setStatus("idle");
  }

  function validate() {
    const next: ContactErrors = {};
    if (values.fullName.trim().length < 2) next.fullName = "Nhập họ tên có ít nhất 2 ký tự.";
    const contact = values.contact.trim();
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(contact);
    const phone = /^(0|\+84)(3|5|7|8|9)\d{8}$/u.test(contact.replace(/[\s.-]/gu, ""));
    if (!email && !phone) next.contact = "Nhập email hoặc số điện thoại Việt Nam hợp lệ.";
    if (values.subject.trim().length < 3) next.subject = "Nhập chủ đề có ít nhất 3 ký tự.";
    if (values.message.trim().length < 10) next.message = "Nội dung cần có ít nhất 10 ký tự.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !validate()) return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ ...values, clientRequestId: requestId.current }),
      });
      const payload = await response.json() as { error?: { message?: string; fields?: ContactErrors } };
      if (!response.ok) {
        if (payload.error?.fields) setErrors(payload.error.fields);
        throw new Error(payload.error?.message ?? "Chưa thể lưu phản hồi lúc này.");
      }
      setStatus("success");
      setMessage("Phản hồi đã được lưu. Nhóm quản trị có thể xem trong hộp thư nội bộ.");
      setValues(initialValues);
      requestId.current = crypto.randomUUID();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Chưa thể lưu phản hồi lúc này. Vui lòng thử lại.");
    }
    window.setTimeout(() => statusRef.current?.focus(), 0);
  }

  return (
    <main id="main-content" className="page-main contact-page">
      <button className="back-button" type="button" onClick={onBack}>Về trang chủ</button>
      <header className="page-intro contact-intro"><h1>Gửi lời nhắn tới quầy trà</h1><p>Phản hồi được lưu trong hệ thống nội bộ của đồ án, không giả vờ gửi email ra ngoài.</p></header>
      <div className="contact-layout">
        <form className="contact-form" onSubmit={submit} noValidate>
          <div ref={statusRef} tabIndex={-1} className={`contact-status state-${status}`} role={status === "error" ? "alert" : "status"} aria-live="polite">
            {status === "sending" ? "Đang lưu phản hồi…" : message}
          </div>
          <label>Họ và tên<input value={values.fullName} maxLength={100} autoComplete="name" onChange={(event) => update("fullName", event.target.value)} aria-invalid={Boolean(errors.fullName)} />{errors.fullName && <span>{errors.fullName}</span>}</label>
          <label>Email hoặc số điện thoại<input value={values.contact} maxLength={160} autoComplete="email" onChange={(event) => update("contact", event.target.value)} aria-invalid={Boolean(errors.contact)} />{errors.contact && <span>{errors.contact}</span>}</label>
          <label>Chủ đề<input value={values.subject} maxLength={120} onChange={(event) => update("subject", event.target.value)} aria-invalid={Boolean(errors.subject)} />{errors.subject && <span>{errors.subject}</span>}</label>
          <label>Nội dung<textarea value={values.message} maxLength={2000} rows={6} onChange={(event) => update("message", event.target.value)} aria-invalid={Boolean(errors.message)} />{errors.message && <span>{errors.message}</span>}</label>
          <button className="button button-primary" type="submit" disabled={status === "sending"}>{status === "sending" ? "Đang lưu" : "Gửi phản hồi"}</button>
        </form>
        <aside className="store-location" aria-labelledby="location-title">
          <h2 id="location-title">Địa điểm cửa hàng</h2>
          {!store && <p>Đang kiểm tra cấu hình địa chỉ…</p>}
          {store?.configured ? <><address>{store.address}</address><a className="button button-secondary" href={store.mapsUrl ?? "#"} target="_blank" rel="noreferrer">Xem trên Google Maps</a><p>Nếu bản đồ không mở, hãy dùng địa chỉ dạng chữ phía trên.</p></> : store && <><p className="location-unconfigured">Địa chỉ cửa hàng chưa được cấu hình cho môi trường này.</p><p>Nhóm dự án cần đặt biến <code>STORE_ADDRESS</code> trước khi đưa chức năng chỉ đường vào sử dụng.</p></>}
        </aside>
      </div>
    </main>
  );
}
