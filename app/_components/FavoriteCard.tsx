import type { FavoriteCat } from "../_db/types";
import { db } from "../_db/db";

export interface FavoriteCardProps {
  cat: FavoriteCat;
}

export function FavoriteCard({ cat }: FavoriteCardProps) {
  const src = cat.imageDataUrl ?? cat.imageUrl ?? "";

  async function remove() {
    if (cat.id != null) {
      await db.favorites.delete(cat.id);
    }
  }

  return (
    <div className="group card relative overflow-hidden bg-base-100 shadow-md">
      <figure className="aspect-square overflow-hidden bg-base-200">
        <img
          src={src}
          alt={cat.name ?? "cat"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </figure>
      <button
        className="btn absolute top-2 right-2 btn-circle opacity-0 shadow transition-opacity btn-xs btn-error group-hover:opacity-100"
        onClick={remove}
        aria-label="Remove from favorites"
      >
        ✕
      </button>
      {cat.name && (
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium">{cat.name}</p>
        </div>
      )}
    </div>
  );
}
