"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "../_db/db";
import type { FavoriteCat } from "../_db/types";

export interface PhotoPickerModalProps {
  open: boolean;
  monthName: string;
  onPick: (cat: FavoriteCat) => void;
  onClose: () => void;
}

export function PhotoPickerModal({
  open,
  monthName,
  onPick,
  onClose,
}: PhotoPickerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const allFavorites = useLiveQuery(() =>
    db.favorites.orderBy("addedAt").reverse().toArray(),
  );

  const filtered = (allFavorites ?? []).filter((cat) => {
    if (!searchTerm.trim()) return true;
    return cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setSearchTerm("");
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function pick(cat: FavoriteCat) {
    onPick(cat);
    dialogRef.current?.close();
  }

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-full max-w-3xl">
        <h3 className="mb-4 text-lg font-bold">
          Choose photo for <span className="text-primary">{monthName}</span>
        </h3>

        <input
          type="text"
          placeholder="Search by name…"
          className="input-bordered input input-sm mb-4 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {(allFavorites ?? []).length === 0 ? (
          <div className="alert">
            <span>
              No favorites yet. <Link href="/browse" className="link">Browse</Link>{" "}
              or <Link href="/upload" className="link">upload</Link> cat photos
              first.
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="alert">
            <span>No cats match your search.</span>
          </div>
        ) : (
          <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                className="aspect-square overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary"
                onClick={() => pick(cat)}
              >
                <img
                  src={cat.imageDataUrl ?? cat.imageUrl ?? ""}
                  alt={cat.name ?? "cat"}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost">Cancel</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
