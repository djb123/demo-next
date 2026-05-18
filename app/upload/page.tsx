"use client";

import { useState } from "react";
import { db } from "@/app/_db/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uploads = useLiveQuery(() =>
    db.favorites
      .toArray()
      .then((all) =>
        all
          .filter((c) => c.isUploaded)
          .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()),
      ),
  );

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErrorMsg("");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await readAsDataURL(file);
        const name = file.name.replace(/\.[^.]+$/, "");
        await db.favorites.add({
          imageDataUrl: dataUrl,
          isUploaded: true,
          name,
          addedAt: new Date(),
        });
      }
    } catch {
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer?.files ?? null);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Upload Your Cats</h1>
      <section
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"}`}
        aria-label="File upload area"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-base-content/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-base-content/60">Drag & drop cat photos here</p>
          <span className="text-sm text-base-content/40">or</span>
          <label className="btn btn-primary">
            {uploading ? "Uploading…" : "Choose Files"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileInput}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-base-content/40">
            Supports JPG, PNG, GIF, WebP
          </p>
        </div>
      </section>

      {errorMsg && (
        <div className="alert alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {uploads?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Uploaded ({uploads.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {uploads.map((cat) => (
              <div
                className="group card relative overflow-hidden bg-base-100 shadow"
                key={cat.id}
              >
                <figure className="aspect-square overflow-hidden bg-base-200">
                  <img
                    src={cat.imageDataUrl}
                    alt={cat.name ?? "cat"}
                    className="h-full w-full object-cover"
                  />
                </figure>
                <button
                  className="btn absolute top-2 right-2 btn-circle opacity-0 shadow transition-opacity btn-xs btn-error group-hover:opacity-100"
                  onClick={() => cat.id != null && db.favorites.delete(cat.id)}
                  aria-label="Remove"
                >
                  ✕
                </button>
                <div className="truncate px-2 py-1 text-sm font-medium">
                  {cat.name ?? ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
