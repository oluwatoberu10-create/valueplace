"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endAdminSession, isAdmin, passwordMatches, startAdminSession } from "@/lib/admin-auth";
import { ORDER_STATUSES, updateOrderStatus, type OrderStatus } from "@/lib/order-records";
import { allowRequest } from "@/lib/rate-limit";

export async function login(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`login:${ip}`, 10, 15 * 60 * 1000)) redirect("/admin?error=limit");

  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !passwordMatches(attempt)) redirect("/admin?error=password");
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin");
}

export async function setStatus(formData: FormData) {
  // Server actions are public endpoints, so every one re-checks the session.
  if (!(await isAdmin())) redirect("/admin");

  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !ORDER_STATUSES.includes(status as OrderStatus)) {
    redirect("/admin?error=update");
  }
  try {
    await updateOrderStatus(id, status as OrderStatus);
  } catch (error) {
    console.error("Could not update order", error);
    redirect("/admin?error=update");
  }
  revalidatePath("/admin");
  redirect("/admin");
}
