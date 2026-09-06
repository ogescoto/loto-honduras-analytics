import type { APIRoute } from "astro";

export const GET: APIRoute = ({ cookies, redirect }) => {
  cookies.delete("loto_token", { path: "/" });
  return redirect("/", 302);
};
