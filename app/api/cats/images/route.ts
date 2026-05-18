import { theCatAPI } from "@/app/_api/cats";
import { NextResponse } from "next/server";
import { Breed, Category } from "@thatapicompany/thecatapi";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;

  const limit = Number(p.get("limit") ?? 20);
  const page = Number(p.get("page") ?? 0);
  const order = (p.get("order") as "ASC" | "DESC" | "RAND") ?? "RAND";
  const hasBreeds = p.has("hasBreeds")
    ? p.get("hasBreeds") === "true"
    : undefined;
  const breedId = p.get("breedId");
  const categoryId = p.get("categoryId");
  const size = (p.get("size") as "small" | "med" | "full") ?? undefined;
  const mimeTypesParam = p.get("mimeTypes");

  const filter: Parameters<typeof theCatAPI.images.searchImages>[0] = {
    limit,
    page,
    order,
    ...(hasBreeds !== undefined && { hasBreeds }),
    ...(breedId && { breeds: [breedId as Breed] }),
    ...(categoryId && { categories: [Number(categoryId) as Category] }),
    ...(size && { size }),
    ...(mimeTypesParam && {
      mimeTypes: mimeTypesParam.split(",") as ("jpg" | "png" | "gif")[],
    }),
  };

  const images = await theCatAPI.images.searchImages(filter);
  return NextResponse.json(images);
}
