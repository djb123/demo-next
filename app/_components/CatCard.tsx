import type { CatImage } from "@/app/_db/types";
import { db } from "@/app/_db/db";
import { useLiveQuery } from "dexie-react-hooks";

export interface CatCardProps {
  image: CatImage;
}

export function CatCard({ image }: CatCardProps) {
  const favQuery = useLiveQuery(() =>
    db.favorites.where("catApiId").equals(image.id).first(),
  );
  const isFavorited = !!favQuery;

  async function toggleFavorite() {
    if (favQuery?.id != null) {
      await db.favorites.delete(favQuery.id);
    } else {
      await db.favorites.add({
        catApiId: image.id,
        imageUrl: image.url,
        isUploaded: false,
        addedAt: new Date(),
      });
    }
  }

  return (
    <div className="group card overflow-hidden bg-base-100 shadow-md transition-shadow hover:shadow-lg">
      <figure className="relative aspect-square overflow-hidden bg-base-200">
        <img
          src={image.url}
          alt="cat"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </figure>
      <div className="card-actions items-center justify-between px-3 py-2">
        {image.breeds?.length ? (
          <span className="badge max-w-24 truncate badge-ghost text-xs">
            {image.breeds[0].name}
          </span>
        ) : (
          <span></span>
        )}
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={toggleFavorite}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
        >
          {isFavorited ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-current text-error"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
