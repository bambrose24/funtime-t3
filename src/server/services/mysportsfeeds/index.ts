import { MSFClient } from "./client";

console.log("msf key?", process.env.MYSPORTSFEEDS_API_KEY);
export const msf = new MSFClient(process.env.MYSPORTSFEEDS_API_KEY ?? "");
