// import { theCatAPI } from '@/app/_api/cats';
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.thecatapi.com/v1/breeds", {
    headers: { "x-api-key": process.env?.CATAPIKEY ?? "" },
  });
  const breeds = await res.json();
  return NextResponse.json(breeds);
}
