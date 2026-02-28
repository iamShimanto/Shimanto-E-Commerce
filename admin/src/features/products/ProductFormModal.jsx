import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Image as ImageIcon, Package, Plus, Trash2 } from "lucide-react"

import { cn } from "../../lib/cn"
import { useToast } from "../../hooks/useToast"
import Button from "../../components/ui/Button"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Modal from "../../components/ui/Modal"
import Select from "../../components/ui/Select"
import TagInput from "../../components/ui/TagInput"
import Textarea from "../../components/ui/Textarea"

import { CATEGORY_OPTIONS, SIZES } from "./productConstants"
import { calcTotalStock, computeFinalPrice, formatMoneyBDT, safeId } from "./productUtils"

export default function ProductFormModal({ open, mode, initialValue, onClose, onSubmit }) {
    const toast = useToast()
    const [form, setForm] = useState(() => initialValue)
    const [errors, setErrors] = useState(() => ({}))

    const thumbUrlRef = useRef(null)
    const imageUrlsRef = useRef([])

    useEffect(() => {
        return () => {
            if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current)
            imageUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
            thumbUrlRef.current = null
            imageUrlsRef.current = []
        }
    }, [])

    const canSubmit = useMemo(() => {
        return form.title?.trim() && Number(form.price) > 0
    }, [form.title, form.price])

    const finalPrice = useMemo(
        () => computeFinalPrice(form.price, form.discountPercentage),
        [form.price, form.discountPercentage]
    )

    const set = (key, value) => setForm((p) => ({ ...p, [key]: value }))

    const validate = () => {
        const next = {}
        if (!form.title?.trim()) next.title = "Title is required"
        if (!form.description?.trim()) next.description = "Description is required"
        if (!form.category) next.category = "Category is required"

        const priceNum = Number(form.price)
        if (!Number.isFinite(priceNum) || priceNum <= 0) next.price = "Price must be > 0"

        const discNum = Number(form.discountPercentage)
        if (Number.isFinite(discNum) && (discNum < 0 || discNum > 100)) {
            next.discountPercentage = "Discount must be 0-100"
        }

        if (mode === "create" && !form.thumbnailPreview) {
            next.thumbnail = "Thumbnail is required (design only)"
        }

        if (!Array.isArray(form.variants) || form.variants.length < 1) {
            next.variants = "Minimum 1 variant is required"
        } else {
            const bad = form.variants.some(
                (v) => !v.sku?.trim() || !v.color?.trim() || !v.sizes || Number(v.stock) < 1
            )
            if (bad) next.variants = "Each variant needs SKU, color, size and stock (>0)"

            const skus = form.variants.map((v) => v.sku?.trim()).filter(Boolean)
            if (new Set(skus).size !== skus.length) next.variants = "SKU must be unique"
        }

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const onPickThumbnail = (file) => {
        if (!file) return
        if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current)
        const url = URL.createObjectURL(file)
        thumbUrlRef.current = url
        setForm((p) => ({ ...p, thumbnailFile: file, thumbnailPreview: url }))
    }

    const onPickImages = (files) => {
        if (!files?.length) return
        imageUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
        const urlList = Array.from(files).slice(0, 6).map((f) => URL.createObjectURL(f))
        imageUrlsRef.current = urlList
        setForm((p) => ({ ...p, imageFiles: Array.from(files).slice(0, 6), imagesPreview: urlList }))
    }

    const onAddTag = (raw) => {
        const v = String(raw || "").trim()
        if (!v) return
        setForm((p) => ({
            ...p,
            tags: Array.from(new Set([...(p.tags || []), v])).slice(0, 12),
        }))
    }

    const onRemoveTag = (tag) => {
        setForm((p) => ({ ...p, tags: (p.tags || []).filter((t) => t !== tag) }))
    }

    const onAddVariant = () => {
        setForm((p) => ({
            ...p,
            variants: [
                ...(p.variants || []),
                { id: safeId(), sku: "", color: "", sizes: "m", stock: 1 },
            ],
        }))
    }

    const onRemoveVariant = (id) => {
        setForm((p) => ({ ...p, variants: (p.variants || []).filter((v) => v.id !== id) }))
    }

    const onChangeVariant = (id, key, value) => {
        setForm((p) => ({
            ...p,
            variants: (p.variants || []).map((v) => (v.id === id ? { ...v, [key]: value } : v)),
        }))
    }

    const submit = (e) => {
        e.preventDefault()
        if (!validate()) {
            toast.error("Validation", "Please fix the highlighted fields")
            return
        }
        onSubmit?.(form)
        toast.success(mode === "edit" ? "Updated" : "Created", "Saved locally (no API)")
        onClose?.()
    }

    return (
        <Modal
            open={open}
            title={mode === "edit" ? "Edit product" : "Create product"}
            description="Design-only form — no API calls"
            onClose={onClose}
        >
            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Field label="Title" error={errors.title}>
                            <Input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                placeholder="Men's Premium Hoodie"
                                aria-invalid={Boolean(errors.title)}
                            />
                        </Field>

                        <Field label="Description" error={errors.description}>
                            <Textarea
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                                placeholder="Write a short, clear description for your product..."
                                aria-invalid={Boolean(errors.description)}
                            />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Category" error={errors.category}>
                                <Select
                                    value={form.category}
                                    onChange={(e) => set("category", e.target.value)}
                                    aria-invalid={Boolean(errors.category)}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            <Field label="Price" error={errors.price}>
                                <Input
                                    inputMode="decimal"
                                    value={form.price}
                                    onChange={(e) => set("price", e.target.value)}
                                    placeholder="1990"
                                    aria-invalid={Boolean(errors.price)}
                                />
                            </Field>

                            <Field label="Discount %" error={errors.discountPercentage}>
                                <Input
                                    inputMode="numeric"
                                    value={form.discountPercentage}
                                    onChange={(e) => set("discountPercentage", e.target.value)}
                                    placeholder="0"
                                    aria-invalid={Boolean(errors.discountPercentage)}
                                />
                            </Field>
                        </div>

                        <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-extrabold">Variants</div>
                                    <div className="text-xs font-semibold text-(--text-muted)">
                                        SKU + color + size + stock. (Backend expects unique SKU.)
                                    </div>
                                </div>
                                <Button type="button" variant="secondary" size="sm" onClick={onAddVariant}>
                                    <Plus size={16} /> Add variant
                                </Button>
                            </div>

                            {errors.variants ? (
                                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">
                                    {errors.variants}
                                </div>
                            ) : null}

                            <div className="mt-4 space-y-3">
                                {(form.variants || []).map((v) => (
                                    <div
                                        key={v.id}
                                        className="grid gap-2 rounded-2xl border border-(--border) bg-(--surface) p-3 sm:grid-cols-12"
                                    >
                                        <div className="sm:col-span-4">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">
                                                SKU
                                            </div>
                                            <Input
                                                className="mt-1 py-2.5"
                                                value={v.sku}
                                                onChange={(e) => onChangeVariant(v.id, "sku", e.target.value)}
                                                placeholder="SKU-001"
                                            />
                                        </div>

                                        <div className="sm:col-span-4">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">
                                                Color
                                            </div>
                                            <Input
                                                className="mt-1 py-2.5"
                                                value={v.color}
                                                onChange={(e) => onChangeVariant(v.id, "color", e.target.value)}
                                                placeholder="Black"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">
                                                Size
                                            </div>
                                            <Select
                                                className="mt-1 py-2.5"
                                                value={v.sizes}
                                                onChange={(e) => onChangeVariant(v.id, "sizes", e.target.value)}
                                            >
                                                {SIZES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s.toUpperCase()}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">
                                                Stock
                                            </div>
                                            <Input
                                                className="mt-1 py-2.5"
                                                inputMode="numeric"
                                                value={v.stock}
                                                onChange={(e) => onChangeVariant(v.id, "stock", e.target.value)}
                                                placeholder="10"
                                            />
                                        </div>

                                        <div className="sm:col-span-12 flex items-center justify-between gap-2">
                                            <div className="text-xs font-semibold text-(--text-muted)">
                                                This variant will be validated locally only.
                                            </div>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => onRemoveVariant(v.id)}
                                            >
                                                <Trash2 size={16} /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-extrabold">Media</div>
                                    <div className="text-xs font-semibold text-(--text-muted)">
                                        Thumbnail + up to 6 images
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-(--surface-2) px-2 py-1 text-[11px] font-extrabold text-(--text-muted)">
                                    <ImageIcon size={14} /> {form.imagesPreview?.length || 0}/6
                                </div>
                            </div>

                            {errors.thumbnail ? (
                                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">
                                    {errors.thumbnail}
                                </div>
                            ) : null}

                            <div className="mt-4">
                                <div className="aspect-4/3 overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)">
                                    {form.thumbnailPreview ? (
                                        <img
                                            src={form.thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-sm font-extrabold text-(--text-muted)">
                                            Thumbnail preview
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onPickThumbnail(e.target.files?.[0])}
                                        className="block w-full text-xs font-semibold text-(--text-muted) file:mr-3 file:rounded-xl file:border-0 file:bg-(--surface-2) file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-(--text) hover:file:bg-(--surface)"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs font-extrabold text-(--text-muted)">
                                    Gallery images
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => onPickImages(e.target.files)}
                                    className="mt-1 block w-full text-xs font-semibold text-(--text-muted) file:mr-3 file:rounded-xl file:border-0 file:bg-(--surface-2) file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-(--text) hover:file:bg-(--surface)"
                                />

                                {form.imagesPreview?.length ? (
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {form.imagesPreview.slice(0, 6).map((src) => (
                                            <div
                                                key={src}
                                                className="aspect-square overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)"
                                            >
                                                <img src={src} alt="" className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-extrabold">Metadata</div>
                                    <div className="text-xs font-semibold text-(--text-muted)">
                                        Tags + status
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-(--surface-2) px-2 py-1 text-[11px] font-extrabold text-(--text-muted)">
                                    <Package size={14} /> Stock {calcTotalStock(form.variants)}
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs font-extrabold text-(--text-muted)">Tags</div>
                                <TagInput
                                    tags={form.tags || []}
                                    onAdd={onAddTag}
                                    onRemove={onRemoveTag}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3">
                                <div>
                                    <div className="text-sm font-extrabold">Active</div>
                                    <div className="text-xs font-semibold text-(--text-muted)">
                                        Show this product in store
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => set("isActive", !form.isActive)}
                                    className={cn(
                                        "relative inline-flex h-10 w-16 items-center rounded-full p-1 transition",
                                        form.isActive ? "bg-(--primary)" : "bg-black/15 dark:bg-white/15"
                                    )}
                                    aria-pressed={form.isActive}
                                >
                                    <span
                                        className={cn(
                                            "inline-block h-8 w-8 rounded-full bg-white shadow-sm transition",
                                            form.isActive ? "translate-x-6" : "translate-x-0"
                                        )}
                                    />
                                </button>
                            </div>

                            <div className="mt-4 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-extrabold text-(--text-muted)">
                                            Preview pricing
                                        </div>
                                        <div className="mt-0.5 text-sm font-extrabold">
                                            {formatMoneyBDT(form.price)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold text-(--text-muted)">
                                            After discount
                                        </div>
                                        <div className="mt-0.5 text-sm font-extrabold">
                                            {finalPrice == null ? "—" : formatMoneyBDT(finalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-semibold text-(--text-muted)">
                        {mode === "edit" ? "Update existing product" : "Create a new product"}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            <Check size={18} /> {mode === "edit" ? "Save changes" : "Create"}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}
