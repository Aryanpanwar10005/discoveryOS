"use client";

import { useState } from "react";

export default function Upload() {
  const [text, setText] = useState("");

  async function upload(file: File) {
    const form = new FormData();

    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setText(data.text);
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            upload(e.target.files[0]);
          }
        }}
      />

      <pre>{text}</pre>
    </div>
  );
}