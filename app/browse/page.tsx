"use client";

import { useState } from "react";
import { CatCard } from "../_components/CatCard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CatImage } from "../_db/types";

const LIMIT = 20;

interface Breed {
  id: string;
  name: string;
}
interface Category {
  id: number;
  name: string;
}

type SortOrder = "ASC" | "DESC" | "RAND";
type CatSize = "small" | "med" | "full";

export default function Browse() {
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [order, setOrder] = useState<SortOrder>("RAND");
  const [size, setSize] = useState<CatSize>("med");
  const [hasBreeds, setHasBreeds] = useState(false);

  const breedsQuery = useQuery<Breed[]>({
    queryKey: ["breeds"],
    queryFn: () => fetch("/api/cats/breeds").then((r) => r.json()),
    staleTime: Infinity,
  });

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/cats/categories").then((r) => r.json()),
    staleTime: Infinity,
  });

  function resetFilters() {
    setSelectedBreed("");
    setSelectedCategory("");
    setOrder("RAND");
    setSize("med");
    setHasBreeds(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Browse Cats</h1>

      <div className="card bg-base-200 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="form-control">
            <label htmlFor="filter-breed" className="label pb-1">
              <span className="label-text text-xs font-medium">Breed</span>
            </label>
            <select
              id="filter-breed"
              className="select-bordered select min-w-36 select-sm"
              value={selectedBreed}
              onChange={(e) => {
                setSelectedBreed(e.target.value);
              }}
            >
              <option value="">All breeds</option>
              {breedsQuery.data?.map((breed) => (
                <option value={breed.id} key={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="filter-category" className="label pb-1">
              <span className="label-text text-xs font-medium">Category</span>
            </label>
            <select
              id="filter-category"
              className="select-bordered select select-sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
            >
              <option value="">All categories</option>
              {categoriesQuery.data?.map((cat) => (
                <option value={cat.id} key={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="filter-order" className="label pb-1">
              <span className="label-text text-xs font-medium">Order</span>
            </label>
            <select
              id="filter-order"
              className="select-bordered select select-sm"
              value={order}
              onChange={(e) => {
                setOrder(e.target.value as SortOrder);
              }}
            >
              <option value="RAND">Random</option>
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>

          <div className="form-control">
            <label htmlFor="filter-size" className="label pb-1">
              <span className="label-text text-xs font-medium">Size</span>
            </label>
            <select
              id="filter-size"
              className="select-bordered select select-sm"
              value={size}
              onChange={(e) => {
                setSize(e.target.value as CatSize);
              }}
            >
              <option value="small">Small</option>
              <option value="med">Medium</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div className="form-control justify-end pb-1">
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-xs font-medium">
                With breed info
              </span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={hasBreeds}
                onChange={(e) => {
                  setHasBreeds(e.target.checked);
                }}
              />
            </label>
          </div>

          <button
            className="btn self-end btn-ghost btn-sm"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>
      </div>

      <Results
        selectedBreed={selectedBreed}
        selectedCategory={selectedCategory}
        order={order}
        size={size}
        hasBreeds={hasBreeds}
      ></Results>
    </div>
  );
}

interface ResultsProps {
  selectedBreed: string;
  selectedCategory: string;
  order: SortOrder;
  size: CatSize;
  hasBreeds: boolean;
}

function Results({
  selectedBreed,
  selectedCategory,
  order,
  size,
  hasBreeds,
}: ResultsProps) {
  const imagesQuery = useInfiniteQuery<CatImage[]>({
    queryKey: [
      "cats",
      {
        breed: selectedBreed,
        category: selectedCategory,
        order,
        size,
        hasBreeds,
      },
    ],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(LIMIT),
        order,
        size,
        ...(hasBreeds && { hasBreeds: "true" }),
        ...(selectedBreed && { breedId: selectedBreed }),
        ...(selectedCategory && { categoryId: String(selectedCategory) }),
      });
      const res = await fetch(`/api/cats/images?${params}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      return res.json() as Promise<CatImage[]>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length < LIMIT ? undefined : (lastPageParam as number) + 1,
  });

  const allImages = imagesQuery.data?.pages.flat() ?? [];

  if (imagesQuery.isPending) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array(LIMIT).map((_, i) => (
          <div className="aspect-square skeleton rounded-xl" key={i}></div>
        ))}
      </div>
    );
  } else if (imagesQuery.isError) {
    return (
      <div className="alert alert-error">
        <span>Failed to load cats. Please try again.</span>
        <button className="btn btn-sm" onClick={() => imagesQuery.refetch()}>
          Retry
        </button>
      </div>
    );
  } else if (allImages.length === 0) {
    return (
      <div className="alert">
        <span>No cats found with these filters. Try different settings.</span>
      </div>
    );
  } else {
    return (
      <>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allImages.map((image) => (
            <CatCard image={image} key={image.id} />
          ))}
          {imagesQuery.isFetchingNextPage &&
            Array(LIMIT).map((_, i) => (
              <div className="aspect-square skeleton rounded-xl" key={i}></div>
            ))}
        </div>

        <div className="flex justify-center py-6">
          {imagesQuery.hasNextPage ? (
            <button
              className="btn btn-primary"
              onClick={() => imagesQuery.fetchNextPage()}
              disabled={imagesQuery.isFetchingNextPage}
            >
              {imagesQuery.isFetchingNextPage ? "Loading…" : "Load More"}
            </button>
          ) : (
            <p className="text-sm text-base-content/50">
              All {allImages.length} cats loaded
            </p>
          )}
        </div>
      </>
    );
  }
}
