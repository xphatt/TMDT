/* eslint-disable @next/next/no-html-link-for-pages -- Static policy routes use native anchors across Vinext builds. */

import type { ReactNode } from "react";

export function PolicyPage({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <main id="main-content" className="policy-page">
      <a className="back-button" href="/">Về cửa hàng</a>
      <article>
        <header><h1>{title}</h1><p>{summary}</p><time dateTime="2026-09-13">Cập nhật ngày 13/09/2026</time></header>
        <div className="policy-notice" role="note"><strong>Lưu ý dành cho đồ án</strong><p>Nội dung này mô tả quy trình hỗ trợ dự kiến và cần được người phụ trách duyệt lại trước khi sử dụng cho hoạt động kinh doanh thật.</p></div>
        {children}
      </article>
    </main>
  );
}
