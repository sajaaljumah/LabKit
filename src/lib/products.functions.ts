import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES = [
  "Essential Tools",
  "Electronics & Development",
  "Student Essentials",
] as const;

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function toProduct(row: Database["public"]["Tables"]["products"]["Row"]): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    stock: row.stock,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error("Could not load products right now.");
  return (data ?? []).map(toProduct);
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id || typeof data.id !== "string") throw new Error("A product id is required.");
    return { id: data.id };
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error("Could not load this product right now.");
    if (!row) return null;
    return toProduct(row);
  });
