"use client";

import { useState } from "react";
import { db } from "../_db/db";
import type { CalendarEvent } from "../_db/types";

export interface EventFormProps {
  calendarId: number;
  year: number;
  editingEvent?: CalendarEvent | null;
  onDone?: () => void;
}

export function EventForm({
  calendarId,
  year,
  editingEvent = null,
  onDone,
}: EventFormProps) {
  const [date, setDate] = useState(editingEvent?.date ?? "");
  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [emoji, setEmoji] = useState(editingEvent?.emoji ?? "");
  const [color, setColor] = useState(editingEvent?.color ?? "#3b82f6");
  const [textColor, setTextColor] = useState(editingEvent?.textColor ?? "#ffffff");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function save() {
    if (!date || !title.trim()) {
      setErrorMsg("Date and title are required.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      if (editingEvent?.id != null) {
        await db.calendarEvents.update(editingEvent.id, {
          date,
          title: title.trim(),
          emoji,
          color,
          textColor,
        });
      } else {
        await db.calendarEvents.add({
          calendarId,
          date,
          title: title.trim(),
          emoji,
          color,
          textColor,
        });
      }
      onDone?.();
    } catch {
      setErrorMsg("Failed to save event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="mb-3 font-semibold">
        {editingEvent ? "Edit Event" : "Add Event"}
      </h3>
      <div className="flex flex-wrap items-end gap-2">
        <div className="form-control">
          <label htmlFor="ev-date" className="label pb-1">
            <span className="label-text text-xs">Date</span>
          </label>
          <input
            id="ev-date"
            type="date"
            className="input-bordered input input-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={`${year}-01-01`}
            max={`${year}-12-31`}
          />
        </div>

        <div className="form-control min-w-40 flex-1">
          <label htmlFor="ev-title" className="label pb-1">
            <span className="label-text text-xs">Event title</span>
          </label>
          <input
            id="ev-title"
            type="text"
            className="input-bordered input input-sm"
            placeholder="e.g. Alex's Birthday!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="form-control w-20">
          <label htmlFor="ev-emoji" className="label pb-1">
            <span className="label-text text-xs">Emoji</span>
          </label>
          <input
            id="ev-emoji"
            type="text"
            className="input-bordered input input-sm text-center"
            placeholder="🐱"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
          />
        </div>

        <div className="form-control">
          <label htmlFor="ev-color" className="label pb-1">
            <span className="label-text text-xs">BG color</span>
          </label>
          <input
            id="ev-color"
            type="color"
            className="input-bordered input input-sm h-9 w-12 p-1"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="ev-textcolor" className="label pb-1">
            <span className="label-text text-xs">Text color</span>
          </label>
          <input
            id="ev-textcolor"
            type="color"
            className="input-bordered input input-sm h-9 w-12 p-1"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>

        <button
          className="btn self-end btn-sm btn-primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : editingEvent ? "Update" : "Add"}
        </button>

        {editingEvent && (
          <button
            className="btn self-end btn-ghost btn-sm"
            onClick={() => onDone?.()}
          >
            Cancel
          </button>
        )}
      </div>
      {errorMsg && <p className="mt-2 text-sm text-error">{errorMsg}</p>}
    </div>
  );
}
