"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/app/_db/db";
import type { CalendarEvent, FavoriteCat } from "@/app/_db/types";
import { MONTH_NAMES } from "@/app/_lib/calendarUtils";
import { CalendarMonth } from "@/app/_components/CalendarMonth";

function CalendarPrintContent() {
  const searchParams = useSearchParams();
  const calendarId = Number(searchParams.get("id") ?? "0");

  const calendar = useLiveQuery(
    () => (calendarId ? db.calendars.get(calendarId) : undefined),
    [calendarId],
  );

  const events =
    useLiveQuery<CalendarEvent[]>(
      () =>
        calendarId
          ? db.calendarEvents.where("calendarId").equals(calendarId).toArray()
          : Promise.resolve([]),
      [calendarId],
    ) ?? [];

  const photoIds = calendar?.photoIds;
  const [photoMap, setPhotoMap] = useState<Map<number, FavoriteCat>>(new Map());

  useEffect(() => {
    if (!photoIds) return;
    const nonNullIds = photoIds.filter((id): id is number => id != null);
    if (nonNullIds.length === 0) return;
    let cancelled = false;
    db.favorites.bulkGet(nonNullIds).then((fetched) => {
      if (cancelled) return;
      setPhotoMap(new Map(fetched.filter(Boolean).map((p) => [p!.id!, p!])));
    });
    return () => {
      cancelled = true;
    };
  }, [photoIds]);

  const slotPhotos: (FavoriteCat | null | undefined)[] = !photoIds
    ? Array(12).fill(undefined)
    : photoIds.map((id) => (id != null ? (photoMap.get(id) ?? null) : null));

  useEffect(() => {
    document.title = `${calendar?.name ?? "Calendar"} ${calendar?.year ?? ""}`.trim();
  }, [calendar]);

  function monthEvents(month: number): CalendarEvent[] {
    return events.filter((e) => {
      const d = new Date(e.date + "T12:00:00");
      return d.getFullYear() === calendar?.year && d.getMonth() === month;
    });
  }

  function print() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
          }
          .month-page {
            page-break-after: always;
            break-after: page;
          }
          .month-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
        @page {
          size: A4 portrait;
          margin: 1cm;
        }
      `}</style>

      {/* Print toolbar */}
      <div className="no-print mb-6 flex items-center justify-between rounded-xl bg-base-200 p-4">
        <div>
          {calendar ? (
            <>
              <h1 className="text-xl font-bold">
                {calendar.name} – {calendar.year}
              </h1>
              <p className="text-sm text-base-content/60">
                {(calendar.photoIds ?? []).filter((id) => id != null).length}/12
                photos assigned
              </p>
            </>
          ) : calendarId === 0 ? (
            <p className="text-error">No calendar ID provided in URL.</p>
          ) : (
            <div className="h-6 w-48 skeleton" />
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/calendar" className="btn btn-ghost btn-sm">
            ← Back
          </Link>
          <button className="btn btn-sm btn-primary" onClick={print}>
            🖨️ Print
          </button>
        </div>
      </div>

      {!calendarId ? (
        <div className="no-print alert alert-error">
          <span>No calendar selected. Go back and choose a calendar to print.</span>
        </div>
      ) : calendar === undefined ? (
        <div className="no-print grid grid-cols-1 gap-0">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="mb-4 h-[297mm] w-full skeleton" />
          ))}
        </div>
      ) : calendar === null ? (
        <div className="no-print alert alert-error">
          <span>Calendar not found.</span>
        </div>
      ) : (
        MONTH_NAMES.map((_, i) => (
          <div
            key={i}
            className="month-page"
            style={{
              width: "100%",
              aspectRatio: "1 / 1.414",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CalendarMonth
              year={calendar.year}
              month={i}
              photo={slotPhotos[i] ?? null}
              events={monthEvents(i)}
              forPrint
            />
          </div>
        ))
      )}
    </>
  );
}

export default function CalendarPrintPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPrintContent />
    </Suspense>
  );
}
