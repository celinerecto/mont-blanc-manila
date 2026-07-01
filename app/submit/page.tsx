"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { getAnonId } from "@/lib/anonId";

const NEIGHBORHOODS = [
  "BGC", "Makati", "Poblacion", "Quezon City", "Mandaluyong",
  "San Juan", "Taguig", "Pasig", "Alabang", "Eastwood", "Other"
];

export default function SubmitPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    cafeName: "", address: "", neighborhood: "", website: "", hours: "",
    itemName: "Mont Blanc", variant: "", price: "", description: "",
  });

  const supabase = createClient();

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? getAnonId();

    if (!form.cafeName || !form.address || !form.neighborhood) {
      setError("Please fill in the café name, address, and neighbourhood.");
      return;
    }

    setSubmitting(true);
    try {
      // Insert cafe
      const { data: cafe, error: cafeErr } = await supabase
        .from("cafes")
        .insert({
          name: form.cafeName,
          address: form.address,
          neighborhood: form.neighborhood,
          lat: 14.5765, // default Manila center — TODO: geocoding
          lng: 121.0,
          website: form.website || null,
          hours: form.hours || null,
          is_verified: false,
          submitted_by: userId,
        })
        .select()
        .single();

      if (cafeErr) throw new Error(cafeErr.message);

      // Insert item
      const { data: item, error: itemErr } = await supabase
        .from("items")
        .insert({
          cafe_id: cafe.id,
          name: form.itemName || "Mont Blanc",
          variant: form.variant || null,
          price: form.price ? parseFloat(form.price) : null,
          description: form.description || null,
        })
        .select()
        .single();

      if (itemErr) throw new Error(itemErr.message);

      // Upload photo
      if (photoFile && item) {
        const ext = photoFile.name.split(".").pop();
        const path = `${userId}/${item.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("photos")
          .upload(path, photoFile, { upsert: true });

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(path);
          await supabase.from("photos").insert({
            item_id: item.id,
            cafe_id: cafe.id,
            user_id: userId,
            storage_url: publicUrl,
          });
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="font-playfair text-4xl font-bold text-espresso mb-3">Submission received!</h1>
        <p className="text-brown mb-6">
          Thanks for submitting! We&apos;ll review your café and publish it within a day or two.
        </p>
        <a href="/browse" className="bg-orange text-white font-bold px-8 py-3 rounded-full hover:bg-orange-hover transition-all inline-block">
          Browse All Cafés ☕
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="font-playfair text-4xl font-bold text-espresso mb-2">Submit a Café 🏔️</h1>
        <p className="text-brown-muted">
          Know a spot serving great Mont Blanc that&apos;s not on our map yet? Add it!
          Submissions are reviewed before going live — usually within a day or two.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cafe details */}
        <section className="bg-cream-surface rounded-3xl border border-brown-border shadow-md p-6 space-y-5">
          <h2 className="font-playfair text-xl font-semibold text-espresso">Café Details</h2>

          <Field label="Café Name *">
            <input name="cafeName" value={form.cafeName} onChange={handleChange} placeholder="e.g. % Arabica BGC" required className={inputClass} />
          </Field>

          <Field label="Address *">
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street address, city" required className={inputClass} />
          </Field>

          <Field label="Neighbourhood *">
            <select name="neighborhood" value={form.neighborhood} onChange={handleChange} required className={inputClass}>
              <option value="">Select neighbourhood</option>
              {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>

          <Field label="Website">
            <input name="website" value={form.website} onChange={handleChange} placeholder="https://..." type="url" className={inputClass} />
          </Field>

          <Field label="Hours">
            <input name="hours" value={form.hours} onChange={handleChange} placeholder="e.g. Mon–Sun 8:00 AM – 9:00 PM" className={inputClass} />
          </Field>
        </section>

        {/* Mont Blanc item */}
        <section className="bg-cream-surface rounded-3xl border border-brown-border shadow-md p-6 space-y-5">
          <h2 className="font-playfair text-xl font-semibold text-espresso">Mont Blanc Details</h2>

          <Field label="Item Name">
            <input name="itemName" value={form.itemName} onChange={handleChange} placeholder="Mont Blanc" className={inputClass} />
          </Field>

          <Field label="Variant">
            <input name="variant" value={form.variant} onChange={handleChange} placeholder="e.g. Iced, Hot, Cold Brew" className={inputClass} />
          </Field>

          <Field label="Price (PHP)">
            <input name="price" value={form.price} onChange={handleChange} type="number" min="0" step="0.01" placeholder="e.g. 350" className={inputClass} />
          </Field>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="What makes it special?" className={`${inputClass} resize-none`} />
          </Field>
        </section>

        {/* Photo upload */}
        <section className="bg-cream-surface rounded-3xl border border-brown-border shadow-md p-6 space-y-4">
          <h2 className="font-playfair text-xl font-semibold text-espresso">Photo (optional)</h2>
          <div
            {...getRootProps()}
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 p-8 ${
              isDragActive ? "border-orange bg-orange-pale" : "border-brown-border hover:border-orange hover:bg-orange-pale/40"
            }`}
          >
            <input {...getInputProps()} />
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-40 rounded-xl object-cover" />
            ) : (
              <>
                <span className="text-4xl">📸</span>
                <p className="text-brown text-sm text-center">
                  {isDragActive ? "Drop it here!" : "Drag & drop a photo, or click to browse"}
                </p>
                <p className="text-brown-muted text-xs">JPG, PNG, WebP · Max 5 MB</p>
              </>
            )}
          </div>
          {photoFile && (
            <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-xs text-brown-muted hover:text-brown transition-colors">
              Remove photo ✕
            </button>
          )}
        </section>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange text-white font-bold py-4 rounded-full hover:bg-orange-hover transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-orange/20 disabled:opacity-60 text-base"
        >
          {submitting ? "Submitting..." : "Submit Café ☕"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brown mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-cream border border-brown-border rounded-xl px-4 py-2.5 text-sm text-brown placeholder-brown-muted focus:outline-none focus:border-orange transition-colors";
