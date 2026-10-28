"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PHOTO_MB } from "@/lib/tripValidation";

// file input with a preview. the real <input type="file"> is hidden
// behind a nicer looking box but still gets keyboard focus and the label.
// accept="image/*" on purpose: you can still pick a gif or svg, and then
// the validation explains why it's not allowed.

export default function PhotoInput({ id, file, error, disabled, onChange, onBlur, describedById }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  // make a temporary url for the preview, and free it when the file changes
  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clear = () => {
    onChange(null);
    // otherwise picking the same file again wouldn't trigger onChange
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center ${
        error ? "border-red-400 bg-red-50/40" : "border-slate-300 bg-white"
      }`}
    >
      <div className="grid h-24 w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 sm:w-32">
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="Preview of the photo you picked" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className="text-3xl">
            🖼️
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2 text-sm">
        {file ? (
          <p className="truncate font-medium text-slate-700" title={file.name}>
            {file.name}{" "}
            <span className="font-normal text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
          </p>
        ) : (
          <p className="text-slate-500">JPG, PNG or WebP, up to {MAX_PHOTO_MB} MB.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition focus-within:ring-4 focus-within:ring-brand-100 hover:border-brand-500 hover:text-brand-600 ${
              disabled ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {file ? "Change photo" : "Choose a photo"}
            <input
              ref={inputRef}
              id={id}
              name="photo"
              type="file"
              accept="image/*"
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={describedById}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
              onBlur={onBlur}
              className="sr-only"
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="rounded-lg px-3 py-1.5 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-red-600 disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
