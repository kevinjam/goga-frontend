import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE_KEYS } from "@/lib/auth-storage";

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has(AUTH_COOKIE_KEYS.access);
  redirect(hasToken ? "/dashboard" : "/login");
}
