import { TheCatAPI } from "@thatapicompany/thecatapi";

export const theCatAPI = new TheCatAPI(process.env?.CATAPIKEY ?? "");
