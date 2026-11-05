import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { formatNaira } from "@/lib/order";
import { listOrders, ORDER_STATUSES, ordersDatabaseConfigured, type OrderRecord } from "@/lib/order-records";
import { login, logout, setStatus } from "./actions";

// Credentials are read per request. Without this, the page is prerendered at build time
// and would keep saying "not set up" after the environment variables are added.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  password: "That password is not correct.",
  limit: "Too many attempts. Please wait a few minutes and try again.",
  update: "The order could not be updated. Please try again.",
};

const STATUS_LABEL = (s: string) => s[0].toUpperCase() + s.slice(1);

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-12 sm:px-6">{children}</main>;
}

function NotSetUp({ what }: { what: string }) {
  return (
    <Shell>
      <h1 className="font-display text-4xl text-wine-800">Staff orders</h1>
      <p data-testid="admin-not-setup" className="mt-4 max-w-xl text-lg text-ink-soft">
        This page isn&apos;t set up yet: {what}. Customers can still order through WhatsApp. See the README for setup.
      </p>
    </Shell>
  );
}

function OrderCard({ order }: { order: OrderRecord }) {
  return (
    <li data-testid="admin-order" data-reference={order.reference} className="border border-wine-800/15 bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-wine-800">{order.reference}</p>
          <p className="text-sm text-ink-soft">
            {new Date(order.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}
          </p>
        </div>
        <form action={setStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={order.id} />
          <label className="sr-only" htmlFor={`status-${order.id}`}>
            Status of order {order.reference}
          </label>
          <select id={`status-${order.id}`} name="status" defaultValue={order.status} className="field !min-h-11 !py-1">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL(s)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary !min-h-11 !px-4 !text-sm">
            Update
          </button>
        </form>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="text-sm">
          <p className="font-semibold">{order.customer_name}</p>
          <p>
            <a className="underline" href={`tel:${order.customer_phone.replace(/[\s()-]/g, "")}`}>
              {order.customer_phone}
            </a>
          </p>
          {order.customer_email && <p>{order.customer_email}</p>}
          <p className="mt-2 font-semibold">{order.fulfilment === "delivery" ? "Delivery" : "Pickup"}</p>
          {order.delivery_address && (
            <p>
              {order.delivery_address}, {order.delivery_area}
            </p>
          )}
          {order.delivery_instructions && <p className="text-ink-soft">{order.delivery_instructions}</p>}
          {order.notes && (
            <p className="mt-2">
              <span className="font-semibold">Notes:</span> {order.notes}
            </p>
          )}
        </div>
        <div className="text-sm">
          <ul className="space-y-1">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {item.name}
                  {Object.keys(item.choices ?? {}).length > 0 && ` (${Object.values(item.choices).join(", ")})`} × {item.qty}
                </span>
                <span className="tabular-nums">{formatNaira(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t border-wine-800/15 pt-2 font-semibold">
            <span>
              Total{order.delivery_fee === null ? " (before delivery)" : ""}
            </span>
            <span className="tabular-nums">{formatNaira(order.total)}</span>
          </p>
        </div>
      </div>
    </li>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!adminConfigured()) return <NotSetUp what="no admin password of at least 12 characters has been configured" />;

  const { error } = await searchParams;
  const message = error ? ERRORS[error] : undefined;

  if (!(await isAdmin())) {
    return (
      <Shell>
        <h1 className="font-display text-4xl text-wine-800">Staff sign in</h1>
        <form action={login} className="mt-6 max-w-sm space-y-4" data-testid="admin-login">
          <div>
            <label htmlFor="password" className="mb-1.5 block font-semibold">
              Password
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="field w-full" />
          </div>
          {message && (
            <p role="alert" className="text-sm font-medium text-error">
              {message}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  if (!ordersDatabaseConfigured()) return <NotSetUp what="no orders database has been connected" />;

  let orders: OrderRecord[] | null = null;
  try {
    orders = await listOrders();
  } catch (e) {
    console.error("Could not load orders", e);
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-wine-800">Orders</h1>
        <form action={logout}>
          <button type="submit" className="btn btn-ghost !min-h-11 !text-sm">
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Orders appear here as soon as a customer finishes checkout. A pending order may not have been sent on WhatsApp
        yet, so check for the matching reference before preparing it.
      </p>
      {message && (
        <p role="alert" className="mt-4 text-sm font-medium text-error">
          {message}
        </p>
      )}
      {orders === null ? (
        <p role="alert" className="mt-8 text-error">
          Orders could not be loaded. Please refresh, or check the database connection.
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-lg text-ink-soft">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </Shell>
  );
}
