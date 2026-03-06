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

export default function ProductFormModal({
    open,
    mode,
    initialValue,
    onClose,
    onSubmit,
    categories,
    submitting = false,
}) {
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

    const existingImages = useMemo(
        () => (Array.isArray(form.existingImages) ? form.existingImages : []),
        [form.existingImages]
    )
    const destroyImages = useMemo(
        () => (Array.isArray(form.destroyImages) ? form.destroyImages : []),
        [form.destroyImages]
    )
    const newImagesPreview = useMemo(
        () => (Array.isArray(form.newImagesPreview) ? form.newImagesPreview : []),
        [form.newImagesPreview]
    )
    const newImageFiles = useMemo(
        () => (Array.isArray(form.imageFiles) ? form.imageFiles : []),
        [form.imageFiles]
    )

    const keptExistingCount = useMemo(() => {
        if (!existingImages.length) return 0
        if (!destroyImages.length) return existingImages.length
        return existingImages.filter((u) => !destroyImages.includes(u)).length
    }, [existingImages, destroyImages])

    const totalGalleryCount = keptExistingCount + newImageFiles.length

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

        if (mode === "create" && !form.thumbnailFile) {
            next.thumbnail = "Thumbnail is required"
        }

        if (mode === "edit") {
            if (totalGalleryCount > 6) next.images = "Maximum 6 images are allowed"
            if (totalGalleryCount < 1) next.images = "Minimum 1 image must remain"
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

        const picked = Array.from(files)
        const remainingSlots = Math.max(0, 6 - totalGalleryCount)
        if (remainingSlots === 0) {
            toast.error("Limit", "You already have 6 images")
            return
        }

        const accepted = picked.slice(0, remainingSlots)
        if (picked.length > accepted.length) {
            toast.error("Limit", `Only ${accepted.length} more image(s) allowed (max 6 total)`)
        }

        const urlList = accepted.map((f) => URL.createObjectURL(f))
        imageUrlsRef.current = [...imageUrlsRef.current, ...urlList]

        setForm((p) => ({
            ...p,
            imageFiles: [...(Array.isArray(p.imageFiles) ? p.imageFiles : []), ...accepted],
            newImagesPreview: [...(Array.isArray(p.newImagesPreview) ? p.newImagesPreview : []), ...urlList],
        }))
    }

    const toggleDestroyExistingImage = (url) => {
        const u = String(url || "")
        if (!u) return
        setForm((p) => {
            const prev = Array.isArray(p.destroyImages) ? p.destroyImages : []
            const next = prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
            return { ...p, destroyImages: next }
        })
    }

    const removeNewImageAt = (index) => {
        setForm((p) => {
            const filesArr = Array.isArray(p.imageFiles) ? [...p.imageFiles] : []
            const prevArr = Array.isArray(p.newImagesPreview) ? [...p.newImagesPreview] : []
            const previewUrl = prevArr[index]
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
                imageUrlsRef.current = imageUrlsRef.current.filter((u) => u !== previewUrl)
            }
            filesArr.splice(index, 1)
            prevArr.splice(index, 1)
            return { ...p, imageFiles: filesArr, newImagesPreview: prevArr }
        })
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

    const submit = async (e) => {
        e.preventDefault()
        if (!validate()) {
            toast.error("Validation", "Please fix the highlighted fields")
            return
        }

        try {
            await Promise.resolve(onSubmit?.(form))
        } catch {
            // parent shows toast; keep modal open
        }
    }

    return (
        <Modal
            open={open}
            title={mode === "edit" ? "Update product" : "Create new product"}
            description={
                mode === "edit"
                    ? "Refine product info, media, variants and pricing."
                    : "Add a polished product with variants, media and pricing."
            }
            onClose={onClose}
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="rounded-2xl border border-(--border) bg-linear-to-r from-(--surface-2) to-(--surface) px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-(--text-muted)">
                            {mode === "edit"
                                ? "Fine tune details and publish updates confidently."
                                : "Fill the details below to create a polished product card."}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-3 py-1.5 text-[11px] font-extrabold text-(--text-muted)">
                            <Package size={13} /> Stock {calcTotalStock(form.variants)}
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                            <Field label="Title" error={errors.title}>
                                <Input
                                    value={form.title}
                                    onChange={(e) => set("title", e.target.value)}
                                    placeholder="Men's Premium Hoodie"
                                    aria-invalid={Boolean(errors.title)}
                                />
                            </Field>

                            <div className="mt-4">
                                <Field label="Description" error={errors.description}>
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => set("description", e.target.value)}
                                        placeholder="Write a short, clear description for your product..."
                                        aria-invalid={Boolean(errors.description)}
                                    />
                                </Field>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                <Field label="Category" error={errors.category}>
                                    <Select
                                        value={form.category}
                                        onChange={(e) => set("category", e.target.value)}
                                        aria-invalid={Boolean(errors.category)}
                                    >
                                        <option value="">Select category</option>
                                        {(Array.isArray(categories) && categories.length
                                            ? categories.map((c) => ({ id: c?._id, name: c?.name }))
                                            : CATEGORY_OPTIONS
                                        )
                                            .filter((c) => c?.id && c?.name)
                                            .map((c) => (
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
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">SKU</div>
                                            <Input
                                                className="mt-1 py-2.5"
                                                value={v.sku}
                                                onChange={(e) => onChangeVariant(v.id, "sku", e.target.value)}
                                                placeholder="SKU-001"
                                            />
                                        </div>

                                        <div className="sm:col-span-4">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">Color</div>
                                            <Input
                                                className="mt-1 py-2.5"
                                                value={v.color}
                                                onChange={(e) => onChangeVariant(v.id, "color", e.target.value)}
                                                placeholder="Black"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">Size</div>
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
                                            <div className="text-[11px] font-extrabold text-(--text-muted)">Stock</div>
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
                                    <ImageIcon size={14} /> {totalGalleryCount}/6
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
                                <div className="text-xs font-extrabold text-(--text-muted)">Gallery images</div>

                                {errors.images ? (
                                    <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">
                                        {errors.images}
                                    </div>
                                ) : null}

                                {mode === "edit" && existingImages.length ? (
                                    <div className="mt-3">
                                        <div className="text-[11px] font-extrabold text-(--text-muted)">
                                            Existing images (click to remove/undo)
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {existingImages.slice(0, 6).map((src) => {
                                                const willDestroy = destroyImages.includes(src)
                                                return (
                                                    <button
                                                        type="button"
                                                        key={src}
                                                        onClick={() => toggleDestroyExistingImage(src)}
                                                        className={cn(
                                                            "relative aspect-square overflow-hidden rounded-2xl border bg-(--surface-2)",
                                                            willDestroy ? "border-rose-300" : "border-(--border)"
                                                        )}
                                                        title={willDestroy ? "Undo remove" : "Remove"}
                                                    >
                                                        <img
                                                            src={src}
                                                            alt=""
                                                            className={cn(
                                                                "h-full w-full object-cover",
                                                                willDestroy ? "opacity-40 grayscale" : "opacity-100"
                                                            )}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "absolute right-2 top-2 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-extrabold",
                                                                willDestroy
                                                                    ? "bg-rose-600 text-white"
                                                                    : "bg-black/55 text-white"
                                                            )}
                                                        >
                                                            <Trash2 size={12} /> {willDestroy ? "Removed" : "Remove"}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : null}

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => onPickImages(e.target.files)}
                                    className="mt-1 block w-full text-xs font-semibold text-(--text-muted) file:mr-3 file:rounded-xl file:border-0 file:bg-(--surface-2) file:px-3 file:py-2 file:text-xs file:font-extrabold file:text-(--text) hover:file:bg-(--surface)"
                                />

                                {newImagesPreview.length ? (
                                    <div className="mt-3">
                                        <div className="text-[11px] font-extrabold text-(--text-muted)">
                                            New images (click trash to remove)
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {newImagesPreview.slice(0, 6).map((src, idx) => (
                                                <div
                                                    key={src}
                                                    className="relative aspect-square overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)"
                                                >
                                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImageAt(idx)}
                                                        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-xl bg-black/55 px-2 py-1 text-[10px] font-extrabold text-white hover:bg-black/65"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-extrabold">Metadata</div>
                                    <div className="text-xs font-semibold text-(--text-muted)">Tags + status</div>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-xl bg-(--surface-2) px-2 py-1 text-[11px] font-extrabold text-(--text-muted)">
                                    <Package size={14} /> Stock {calcTotalStock(form.variants)}
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs font-extrabold text-(--text-muted)">Tags</div>
                                <TagInput tags={form.tags || []} onAdd={onAddTag} onRemove={onRemoveTag} />
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
                                        <div className="text-xs font-extrabold text-(--text-muted)">Preview pricing</div>
                                        <div className="mt-0.5 text-sm font-extrabold">
                                            {formatMoneyBDT(form.price)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold text-(--text-muted)">After discount</div>
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
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-muted)">
                        <span className="inline-block h-2 w-2 rounded-full bg-(--primary)" />
                        {mode === "edit" ? "Ready to update this product" : "Ready to publish this product"}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit || submitting}>
                            <Check size={18} />
                            {submitting
                                ? mode === "edit"
                                    ? "Updating…"
                                    : "Creating…"
                                : mode === "edit"
                                    ? "Update product"
                                    : "Create product"}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
}
