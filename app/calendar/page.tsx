"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/app/_db/db";
import type { CalendarEvent, CalendarRecord, FavoriteCat } from "@/app/_db/types";
import { getDefaultYear, MONTH_NAMES } from "@/app/_lib/calendarUtils";
import { PhotoPickerModal } from "@/app/_components/PhotoPickerModal";
import { EventForm } from "@/app/_components/EventForm";
import { CalendarMonth } from "@/app/_components/CalendarMonth";

function sortedEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export default function CalendarPage() {
  // ── Calendar list ──────────────────────────────────────────────────────
  const allCalendars = useLiveQuery(() =>
    db.calendars.orderBy("createdAt").reverse().toArray(),
  );

  // ── New calendar form ──────────────────────────────────────────────────
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(getDefaultYear());
  const [creating, setCreating] = useState(false);

  async function createCalendar() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const id = (await db.calendars.add({
        name: newName.trim(),
        year: newYear,
        photoIds: Array(12).fill(null),
        createdAt: new Date(),
      })) as number;
      setActiveCalendarId(id);
      setNewName("");
    } finally {
      setCreating(false);
    }
  }

  async function deleteCalendar(cal: CalendarRecord) {
    if (!confirm(`Delete "${cal.name}"? This will also delete all its events.`))
      return;
    await db.calendarEvents.where("calendarId").equals(cal.id!).delete();
    await db.calendars.delete(cal.id!);
    if (activeCalendarId === cal.id) setActiveCalendarId(null);
  }

  // ── Active calendar ─────────────────────────────────────────────────────
  const [activeCalendarId, setActiveCalendarId] = useState<number | null>(null);

  const activeCalendar = useLiveQuery(
    () => (activeCalendarId != null ? db.calendars.get(activeCalendarId) : undefined),
    [activeCalendarId],
  );

  const activeEvents =
    useLiveQuery<CalendarEvent[]>(
      () =>
        activeCalendarId != null
          ? db.calendarEvents.where("calendarId").equals(activeCalendarId).toArray()
          : Promise.resolve([]),
      [activeCalendarId],
    ) ?? [];

  // Load photos for the 12 slots
  const activePhotoIds = activeCalendar?.photoIds;
  const [photoMap, setPhotoMap] = useState<Map<number, FavoriteCat>>(new Map());

  useEffect(() => {
    if (!activePhotoIds) return;
    const nonNullIds = activePhotoIds.filter((id): id is number => id != null);
    if (nonNullIds.length === 0) return;
    let cancelled = false;
    db.favorites.bulkGet(nonNullIds).then((fetched) => {
      if (cancelled) return;
      setPhotoMap(new Map(fetched.filter(Boolean).map((p) => [p!.id!, p!])));
    });
    return () => {
      cancelled = true;
    };
  }, [activePhotoIds]);

  const slotPhotos: (FavoriteCat | null | undefined)[] = !activePhotoIds
    ? Array(12).fill(undefined)
    : activePhotoIds.map((id) => (id != null ? (photoMap.get(id) ?? null) : null));

  // ── Photo picker modal ───────────────────────────────────────────────────
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [pickingMonthIndex, setPickingMonthIndex] = useState<number | null>(null);

  function openPhotoPicker(monthIndex: number) {
    setPickingMonthIndex(monthIndex);
    setPhotoPickerOpen(true);
  }

  async function handlePhotoPick(cat: FavoriteCat) {
    if (activeCalendarId == null || pickingMonthIndex == null || !activeCalendar)
      return;
    const photoIds = [...(activeCalendar.photoIds ?? Array(12).fill(null))];
    photoIds[pickingMonthIndex] = cat.id ?? null;
    await db.calendars.update(activeCalendarId, { photoIds });
  }

  async function clearSlot(monthIndex: number) {
    if (activeCalendarId == null || !activeCalendar) return;
    const photoIds = [...(activeCalendar.photoIds ?? Array(12).fill(null))];
    photoIds[monthIndex] = null;
    await db.calendars.update(activeCalendarId, { photoIds });
  }

  // ── Event management ─────────────────────────────────────────────────────
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  async function deleteEvent(ev: CalendarEvent) {
    if (ev.id != null) await db.calendarEvents.delete(ev.id);
  }

  // ── Preview calendar shown below builder ─────────────────────────────────
  const [showPreview, setShowPreview] = useState(false);
  const previewSectionRef = useRef<HTMLDivElement>(null);

  function togglePreview() {
    setShowPreview((prev) => !prev);
  }

  useEffect(() => {
    if (showPreview) {
      previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPreview]);

  const filledSlots = (activeCalendar?.photoIds ?? []).filter((id) => id != null).length;
  const cal = activeCalendar;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">My Calendars</h1>
      </div>

      {/* Create new calendar */}
      <div className="card bg-base-200 p-4">
        <h2 className="mb-3 font-semibold">New Calendar</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="form-control min-w-48 flex-1">
            <label htmlFor="cal-name" className="label pb-1">
              <span className="label-text text-xs">Calendar name</span>
            </label>
            <input
              id="cal-name"
              type="text"
              className="input-bordered input input-sm"
              placeholder="e.g. Family Cats 2027"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={60}
              onKeyDown={(e) => e.key === "Enter" && createCalendar()}
            />
          </div>
          <div className="form-control">
            <label htmlFor="cal-year" className="label pb-1">
              <span className="label-text text-xs">Year</span>
            </label>
            <input
              id="cal-year"
              type="number"
              className="input-bordered input input-sm w-24"
              value={newYear}
              onChange={(e) => setNewYear(Number(e.target.value))}
              min={2024}
              max={2040}
            />
          </div>
          <button
            className="btn self-end btn-sm btn-primary"
            onClick={createCalendar}
            disabled={creating || !newName.trim()}
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* Calendar list */}
      {allCalendars === undefined ? (
        <div className="flex gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 w-48 skeleton rounded-xl" />
          ))}
        </div>
      ) : allCalendars.length === 0 ? (
        <div className="alert">
          <span>No calendars yet. Create one above to get started.</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {allCalendars.map((c) => (
            <div
              key={c.id}
              className={`card cursor-pointer border-2 bg-base-100 shadow transition-colors ${
                activeCalendarId === c.id
                  ? "border-primary"
                  : "border-transparent hover:border-base-300"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveCalendarId(c.id ?? null)}
              onKeyDown={(e) => e.key === "Enter" && setActiveCalendarId(c.id ?? null)}
            >
              <div className="card-body px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-base-content/60">{c.year}</p>
                  </div>
                  <button
                    className="btn btn-circle text-error opacity-60 btn-ghost btn-xs hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCalendar(c);
                    }}
                    aria-label="Delete calendar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar editor */}
      {cal && (
        <>
          <div className="divider" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold">
              {cal.name} – {cal.year}
            </h2>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={togglePreview}>
                {showPreview ? "Hide preview" : "Show preview"}
              </button>
              <Link
                href={`/calendar/print?id=${cal.id}`}
                className="btn btn-sm btn-primary"
                target="_blank"
              >
                Preview & Print
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <span>{filledSlots}/12 photos assigned</span>
            {filledSlots === 12 && (
              <span className="badge badge-sm badge-success">Ready to print!</span>
            )}
          </div>

          {/* 12 month slots (3×4 grid) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {MONTH_NAMES.map((monthName, i) => {
              const photo = slotPhotos[i];
              return (
                <div key={monthName} className="group relative">
                  <button
                    className={`aspect-3/4 w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                      photo
                        ? "border-transparent"
                        : "border-base-300 bg-base-200 hover:border-primary/50"
                    }`}
                    onClick={() => openPhotoPicker(i)}
                    title={`Pick photo for ${monthName}`}
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo.imageDataUrl ?? photo.imageUrl ?? ""}
                          alt={monthName}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                          <span className="rounded bg-black/50 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100">
                            Change
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1">
                        <span className="text-2xl opacity-30">🐱</span>
                        <span className="text-xs text-base-content/40">{monthName}</span>
                      </div>
                    )}
                  </button>
                  {photo && (
                    <button
                      className="btn absolute top-1 right-1 z-10 btn-circle opacity-0 shadow transition-opacity btn-xs btn-error group-hover:opacity-100"
                      onClick={() => clearSlot(i)}
                      aria-label="Remove photo"
                    >
                      ✕
                    </button>
                  )}
                  <p className="mt-1 text-center text-xs font-medium text-base-content/60">
                    {monthName}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Events section */}
          <div className="divider">Events</div>

          <EventForm
            key={editingEvent?.id ?? "new"}
            calendarId={cal.id!}
            year={cal.year}
            editingEvent={editingEvent}
            onDone={() => setEditingEvent(null)}
          />

          {activeEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Style</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents(activeEvents).map((ev) => (
                    <tr key={ev.id}>
                      <td className="whitespace-nowrap">{ev.date}</td>
                      <td>
                        <span className="font-medium">
                          {ev.emoji ?? ""} {ev.title}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge badge-sm"
                          style={{
                            backgroundColor: ev.color ?? "#3b82f6",
                            color: ev.textColor ?? "#fff",
                            border: "none",
                          }}
                        >
                          {ev.title.slice(0, 12)}
                        </span>
                      </td>
                      <td className="flex gap-1">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditingEvent(ev)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn text-error btn-ghost btn-xs"
                          onClick={() => deleteEvent(ev)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-base-content/50">
              No events yet. Add important dates above.
            </p>
          )}

          {/* Mini preview */}
          {showPreview && (
            <>
              <div className="divider" ref={previewSectionRef}>
                Preview
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {MONTH_NAMES.map((_, i) => (
                  <div key={i} className="aspect-3/4">
                    <CalendarMonth
                      year={cal.year}
                      month={i}
                      photo={slotPhotos[i] ?? null}
                      events={activeEvents.filter((e) => {
                        const d = new Date(e.date + "T12:00:00");
                        return d.getMonth() === i && d.getFullYear() === cal.year;
                      })}
                    />
                  </div>
                ))}
              </div>
              <p className="p-3 text-center">
                <Link
                  href={`/calendar/print?id=${cal.id}`}
                  className="btn btn-sm btn-primary"
                  target="_blank"
                >
                  Preview & Print
                </Link>
              </p>
            </>
          )}
        </>
      )}

      {/* Photo picker modal */}
      <PhotoPickerModal
        open={photoPickerOpen}
        monthName={pickingMonthIndex != null ? MONTH_NAMES[pickingMonthIndex] : ""}
        onPick={handlePhotoPick}
        onClose={() => setPhotoPickerOpen(false)}
      />
    </div>
  );
}
