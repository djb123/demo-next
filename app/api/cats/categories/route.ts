import { NextResponse } from "next/server";

const CATEGORIES = [
  { id: 1, name: "Hats" },
  { id: 2, name: "Space" },
  { id: 4, name: "Sunglasses" },
  { id: 5, name: "Boxes" },
  { id: 7, name: "Ties" },
  { id: 14, name: "Sinks" },
  { id: 15, name: "Clothes" },
];

export async function GET() {
  return NextResponse.json(CATEGORIES);
}
