"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Edit3, ImagePlus, Plus, Star, Trash2, X } from "lucide-react";

import ProductImage from "@/components/products/ProductImage";
import { useStore } from "@/components/store/StoreProvider";
import type { Availability, Product, ProductCategory } from "@/types/product";

const makeProduct = (category: ProductCategory, order: number): Product => ({
  id: `local-${Date.now()}`,
  slug: "",
  name: "",
  description: "",
  price: 0,
  category,
  flavour: "",
  size: "",
  preparationTime: "",
  image: "",
  imagePublicId: "",
  availability: "AVAILABLE",
  featured: false,
  freshToday: category === "dessert",
  displayOrder: order,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function uploadCollection(category: ProductCategory, freshTodayOnly: boolean) {
  if (freshTodayOnly) return "fresh-today";
  return category === "cake" ? "cakes" : "desserts";
}

export default function AdminProductManager({ category, freshTodayOnly = false }: { category: ProductCategory; freshTodayOnly?: boolean }) {
  const { products, upsertProduct, removeProduct, refreshAdminProducts, productsError } = useStore();
  const items = products.filter((product) => product.category === category && (!freshTodayOnly || product.freshToday)).sort((left, right) => left.displayOrder - right.displayOrder);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirming, setConfirming] = useState<Product | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const label = freshTodayOnly ? "Fresh Today item" : category === "cake" ? "Cake" : "Dessert";

  useEffect(() => { void refreshAdminProducts(); }, [refreshAdminProducts]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || saving) return;
    const product = {
      ...editing,
      freshToday: freshTodayOnly ? true : editing.freshToday,
      slug: editing.slug || slugify(editing.name),
      image: editing.image?.trim() || undefined,
      imagePublicId: editing.imagePublicId?.trim() || undefined,
    };
    setSaving(true);
    setUploadMessage("Saving product…");
    try {
      const isNew = product.id.startsWith("local-");
      const response = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const saved = await response.json().catch(() => ({})) as Product & { message?: string };
      if (!response.ok || !saved.id) throw new Error(saved.message ?? "Product could not be saved.");
      upsertProduct(saved);
      setEditing(null);
      setUploadMessage("");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirming || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(confirming.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(result.message ?? "Product could not be deleted.");
      }
      removeProduct(confirming.id);
      const result = await response.json().catch(() => ({})) as { imageCleanupFailed?: boolean };
      setDeleteMessage(result.imageCleanupFailed ? "Product deleted permanently. Its image could not be removed from Cloudinary." : "Product deleted permanently.");
      setConfirming(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Product could not be deleted.");
      setConfirming(null);
    } finally {
      setDeleting(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editing) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]).has(file.type)) {
      setUploadMessage("Please choose a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadMessage("Images must be smaller than 8 MB.");
      return;
    }

    setUploading(true);
    setUploadMessage("Uploading image securely…");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("collection", uploadCollection(category, freshTodayOnly));
      const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const result = await response.json().catch(() => ({})) as { url?: string; publicId?: string; message?: string };
      if (!response.ok || !result.url || !result.publicId) throw new Error(result.message ?? "Image upload could not be completed.");
      setEditing((current) => current ? { ...current, image: result.url, imagePublicId: result.publicId } : current);
      setUploadMessage("Image uploaded. It will be saved with this product when you save the form.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Image upload could not be completed.");
    } finally {
      setUploading(false);
    }
  };

  return <>
    <div className="rounded-[1.75rem] bg-[var(--cream-white)] p-5 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="glaze-eyebrow text-[var(--caramel)]">Product management</p><h1 className="mt-2 font-display text-4xl md:text-5xl">{freshTodayOnly ? "Fresh Today" : category === "cake" ? "Cakes" : "Desserts"}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--cocoa)]/60">Manage the products customers see. Image uploads are stored in Cloudinary through the protected admin route.</p></div>
        <button onClick={() => { setEditing({ ...makeProduct(category, items.length + 1), freshToday: freshTodayOnly || category === "dessert" }); setUploadMessage(""); }} className="glaze-primary-button flex h-11 items-center gap-2 rounded-full px-5 text-[9px] font-semibold uppercase tracking-[.14em]"><Plus size={15} /> Add new {label.toLowerCase()}</button>
      </div>
      {productsError && <p role="status" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{productsError}</p>}{deleteError && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{deleteError}</p>}{deleteMessage && <p role="status" className="mt-5 rounded-xl bg-[#edf5e9] px-4 py-3 text-sm text-[#496a42]">{deleteMessage}</p>}<div className="mt-7 overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="border-y border-[var(--cocoa)]/10 text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)]/50"><tr><th className="py-3 font-inherit">Product</th><th className="py-3 font-inherit">Price</th><th className="py-3 font-inherit">Availability</th><th className="py-3 font-inherit">Homepage</th><th className="py-3 font-inherit">Order</th><th className="py-3 text-right font-inherit">Actions</th></tr></thead><tbody>{items.map((product) => <tr key={product.id} className="border-b border-[var(--cocoa)]/8 text-sm"><td className="py-3"><div className="flex items-center gap-3"><div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#e6d6c2]"><ProductImage product={product} /></div><div><p className="font-display text-lg leading-none">{product.name}</p><p className="mt-1 text-[8px] text-[var(--cocoa)]/50">{product.flavour || "No flavour set"}</p></div></div></td><td className="py-3">₹{product.price.toLocaleString("en-IN")}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-[8px] font-semibold uppercase tracking-[.1em] ${product.availability === "AVAILABLE" ? "bg-[#dde8da] text-[#557650]" : product.availability === "SOLD_OUT" ? "bg-[#f2ded6] text-[#9b4e35]" : "bg-stone-200 text-stone-500"}`}>{product.availability.replace("_", " ")}</span></td><td className="py-3 text-[8px] font-semibold uppercase tracking-[.1em]">{product.freshToday ? "Fresh today" : product.featured ? "Featured" : "—"}</td><td className="py-3">{product.displayOrder}</td><td className="py-3"><div className="flex justify-end gap-2"><button onClick={() => { setEditing(product); setUploadMessage(""); }} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--cocoa)]/15 hover:border-[var(--caramel)] hover:text-[var(--caramel)]" aria-label={`Edit ${product.name}`}><Edit3 size={13} /></button><button onClick={() => setConfirming(product)} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--cocoa)]/15 hover:border-red-400 hover:text-red-700" aria-label={`Delete ${product.name} permanently`}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>
    </div>

    {editing && <div className="fixed inset-0 z-[100] overflow-y-auto bg-[var(--cocoa)]/35 p-4 backdrop-blur-sm"><form onSubmit={save} className="mx-auto my-6 max-w-2xl rounded-[1.75rem] bg-[var(--cream-white)] p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="glaze-eyebrow text-[var(--caramel)]">{editing.name ? `Edit ${label}` : `New ${label}`}</p><h2 className="mt-2 font-display text-4xl">{editing.name || `Add ${label}`}</h2></div><button type="button" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--cocoa)]/15" aria-label="Close"><X size={16} /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="glaze-label">{label} name</span><input required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value, slug: editing.slug || slugify(event.target.value) })} className="glaze-field" /></label>
        <label className="sm:col-span-2"><span className="glaze-label">Description</span><textarea required value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="glaze-field min-h-24 resize-none p-3" /></label>
        <label><span className="glaze-label">Price (₹)</span><input required min="0" type="number" value={editing.price || ""} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} className="glaze-field" /></label>
        <label><span className="glaze-label">Flavour</span><input value={editing.flavour ?? ""} onChange={(event) => setEditing({ ...editing, flavour: event.target.value })} className="glaze-field" placeholder="e.g. Chocolate" /></label>
        <label><span className="glaze-label">Preparation time</span><input value={editing.preparationTime ?? ""} onChange={(event) => setEditing({ ...editing, preparationTime: event.target.value })} className="glaze-field" placeholder="e.g. 48 hours" /></label>
        <label><span className="glaze-label">Display order</span><input required min="0" type="number" value={editing.displayOrder} onChange={(event) => setEditing({ ...editing, displayOrder: Number(event.target.value) })} className="glaze-field" /></label>
        <div className="sm:col-span-2"><span className="glaze-label">Photo</span><div className="mt-1 flex flex-wrap items-center gap-3"><label className="glaze-outline-button flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-[9px] font-semibold uppercase tracking-[.13em]"><ImagePlus size={15} />{uploading ? "Uploading…" : "Upload to Cloudinary"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadImage} disabled={uploading} className="sr-only" /></label><span className="text-xs text-[var(--cocoa)]/50">JPG, PNG, WebP or AVIF · 8 MB max</span></div><input value={editing.image ?? ""} onChange={(event) => setEditing({ ...editing, image: event.target.value, imagePublicId: undefined })} className="glaze-field mt-3" placeholder="Cloudinary URL or existing public image path" />{editing.image && <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-xl bg-[#e6d6c2]"><ProductImage product={editing} /></div>}{uploadMessage && <p role="status" className="mt-2 text-xs leading-5 text-[var(--cocoa)]/65">{uploadMessage}</p>}</div>
        <label><span className="glaze-label">Availability</span><select value={editing.availability} onChange={(event) => setEditing({ ...editing, availability: event.target.value as Availability })} className="glaze-field"><option value="AVAILABLE">Available</option><option value="SOLD_OUT">Sold out</option><option value="HIDDEN">Hidden</option></select></label>
        <label><span className="glaze-label">Slug</span><input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: slugify(event.target.value) })} className="glaze-field" /></label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><label className="glaze-check"><input type="checkbox" checked={editing.featured} onChange={(event) => setEditing({ ...editing, featured: event.target.checked })} /><Star size={14} /> Featured</label><label className="glaze-check"><input type="checkbox" checked={editing.freshToday} disabled={freshTodayOnly} onChange={(event) => setEditing({ ...editing, freshToday: event.target.checked })} /><Star size={14} /> Fresh Today</label><label className="glaze-check"><input type="checkbox" checked={editing.category === "dessert"} disabled /> Dessert type</label></div>
      <button disabled={saving || uploading} className="glaze-primary-button mt-7 flex h-12 w-full items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-[.15em] disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : `Save ${label}`}</button>
    </form></div>}

    {confirming && <div className="fixed inset-0 z-[110] grid place-items-center bg-[var(--cocoa)]/35 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-sm rounded-[1.75rem] bg-[var(--cream-white)] p-6 text-center shadow-2xl"><Trash2 size={24} className="mx-auto text-red-700" /><h2 id="delete-product-title" className="mt-4 font-display text-3xl">Delete this item permanently?</h2><p className="mt-2 text-sm leading-6 text-[var(--cocoa)]/60">{confirming.name} will be permanently deleted. This action cannot be undone.</p><div className="mt-6 grid grid-cols-2 gap-3"><button disabled={deleting} onClick={() => setConfirming(null)} className="glaze-outline-button h-11 rounded-full text-[9px] font-semibold uppercase tracking-[.14em] disabled:opacity-60">Cancel</button><button disabled={deleting} onClick={() => void deleteProduct()} className="h-11 rounded-full bg-red-700 text-[9px] font-semibold uppercase tracking-[.14em] text-white hover:bg-red-800 disabled:opacity-60">{deleting ? "Deleting…" : "Delete permanently"}</button></div></div></div>}
  </>;
}
