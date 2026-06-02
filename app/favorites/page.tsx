"use client";

import { useState } from "react";
import { db } from "@/app/_db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { FavoriteCard } from "../_components/FavoriteCard";
import Link from "next/link";

export default function Favorites() {
  const [activeTab, setActiveTab] = useState<"api" | "uploads">("api");

  const allFavorites = useLiveQuery(() =>
    db.favorites.orderBy("addedAt").reverse().toArray(),
  );

  const apiFavorites = allFavorites?.filter((f) => !f.isUploaded) ?? [];
  const uploadedFavorites = allFavorites?.filter((f) => f.isUploaded) ?? [];
  const displayed = activeTab === "api" ? apiFavorites : uploadedFavorites;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Favorites</h1>

      <div role="tablist" className="tabs-bordered tabs">
        <button
          role="tab"
          className="tab {activeTab === 'api' ? 'tab-active' : ''}"
          onClick={() => setActiveTab("api")}
        >
          Cat API ({apiFavorites.length})
        </button>
        <button
          role="tab"
          className="tab {activeTab === 'uploads' ? 'tab-active' : ''}"
          onClick={() => setActiveTab("uploads")}
        >
          My Uploads ({uploadedFavorites.length})
        </button>
      </div>

      {allFavorites === undefined ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array(8).map((_, i) => (
            <div className="aspect-square skeleton rounded-xl" key={i}></div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="alert">
          {activeTab === "api" ? (
            <span>
              No favorited cats yet.
              <Link href="/browse" className="link">
                Browse cats
              </Link>{" "}
              and click ❤ to save them here.
            </span>
          ) : (
            <span>
              No uploads yet.
              <Link href="/upload" className="link">
                Upload your cats
              </Link>{" "}
              to get started.
            </span>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayed.map((cat) => (
            <FavoriteCard cat={cat} key={cat.id} />
          ))}
        </div>
      )}
    </div>
  );
}
