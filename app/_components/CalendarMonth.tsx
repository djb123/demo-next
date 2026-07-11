import type { CalendarEvent, FavoriteCat } from "../_db/types";
import { DAY_NAMES, getMonthGrid, MONTH_NAMES } from "../_lib/calendarUtils";

export interface CalendarMonthProps {
  year: number;
  month: number;
  photo: FavoriteCat | null | undefined;
  events: CalendarEvent[];
  forPrint?: boolean;
}

export function CalendarMonth({ year, month, photo, events }: CalendarMonthProps) {
  const grid = getMonthGrid(year, month);
  const photoSrc = photo?.imageDataUrl ?? photo?.imageUrl ?? "";

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date + "T12:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      (eventsByDay[day] ??= []).push(ev);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-base-300 bg-base-100">
      {/* Photo: top ~50% */}
      <div className="relative overflow-hidden bg-base-200" style={{ flex: "0 0 50%" }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={`${MONTH_NAMES[month]} ${year}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-content/20">
            <span className="text-6xl">🐱</span>
          </div>
        )}
      </div>

      {/* Calendar grid: bottom ~50% */}
      <div className="flex min-h-0 flex-1 flex-col p-2">
        <h2 className="mb-1 shrink-0 text-center text-sm font-bold">
          {MONTH_NAMES[month]} {year}
        </h2>

        {/* Day-of-week headers */}
        <div className="grid shrink-0 grid-cols-7">
          {DAY_NAMES.map((day, i) => (
            <div
              key={i}
              className="py-0.5 text-center text-[9px] font-semibold text-base-content/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid flex-1 grid-cols-7">
          {grid.map((cell, i) => (
            <div
              key={i}
              className={`overflow-hidden border border-base-200 p-0.5 ${
                !cell ? "bg-base-200/50" : ""
              }`}
              style={{ minHeight: 0 }}
            >
              {cell && (
                <>
                  <span className="block text-[9px] leading-none font-semibold">
                    {cell}
                  </span>
                  {eventsByDay[cell] && (
                    <div className="mt-px flex flex-col gap-px">
                      {eventsByDay[cell].map((ev, evI) => (
                        <span
                          key={ev.id ?? evI}
                          className="block truncate rounded px-0.5 text-[7px] leading-tight"
                          style={{
                            backgroundColor: ev.color ?? "#3b82f6",
                            color: ev.textColor ?? "#fff",
                          }}
                        >
                          {ev.emoji ?? ""}
                          {ev.title}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
