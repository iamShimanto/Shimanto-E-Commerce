import { useEffect, useMemo, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"

import { useToast } from "../../../hooks/useToast"

import Button from "../../../components/ui/Button"
import Field from "../../../components/ui/Field"
import Input from "../../../components/ui/Input"
import Modal from "../../../components/ui/Modal"
import Select from "../../../components/ui/Select"
import Textarea from "../../../components/ui/Textarea"
import { useUpdateCategoryMutation } from "../../../api/category/categoryApi"


function validateImage(file, toast) {
    if (!file.type?.startsWith("image/")) {
        toast.error("Invalid file", "Please select an image")
        return false
    }
    if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", "Image must be under 2MB")
        return false
    }
    return true
}

export default function CategoryEditModal({ open, onClose, category }) {
    const toast = useToast()

    const [name, setName] = useState(() => category?.name ?? "")
    const [description, setDescription] = useState(() => category?.description ?? "")
    const [isActive, setIsActive] = useState(() => (category?.isActive ? "true" : "false"))
    const [thumbnailFile, setThumbnailFile] = useState(null)

    const fileRef = useRef(null)

    const [updateCategory, { isLoading }] = useUpdateCategoryMutation()

    const thumbnailPreviewUrl = useMemo(() => {
        if (!thumbnailFile) return ""
        return URL.createObjectURL(thumbnailFile)
    }, [thumbnailFile])

    useEffect(() => {
        return () => {
            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl)
        }
    }, [thumbnailPreviewUrl])

    const handleClose = () => {
        onClose?.()
        setThumbnailFile(null)
        if (fileRef.current) fileRef.current.value = ""
    }

    const onPickThumbnail = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!validateImage(file, toast)) return
        setThumbnailFile(file)
    }

    const onSubmit = async () => {
        const trimmedName = name.trim()

        if (!category?.slug) {
            toast.error("Update failed", "Missing category slug")
            return
        }

        if (!trimmedName) {
            toast.error("Validation", "Category name is required")
            return
        }

        try {
            await updateCategory({
                slug: category.slug,
                name: trimmedName,
                description: description.trim(),
                isActive,
                thumbnail: thumbnailFile || undefined,
            }).unwrap()

            toast.success("Updated", "Category updated successfully")
            handleClose()
        } catch (err) {
            const msg =
                err?.data?.message ||
                err?.data?.error ||
                err?.message ||
                "Failed to update category"
            toast.error("Update failed", msg)
        }
    }

    return (
        <Modal
            open={open}
            title="Edit category"
            description="Update the category details and thumbnail."
            onClose={handleClose}
        >
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                        <div className="text-xs font-extrabold text-(--text-muted)">Thumbnail</div>
                        <div className="mt-3 overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
                            <div className="relative aspect-4/3 w-full bg-(--surface-2)">
                                {thumbnailPreviewUrl || category?.thumbnail ? (
                                    <img
                                        src={thumbnailPreviewUrl || category?.thumbnail}
                                        alt="Thumbnail preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="grid h-full w-full place-items-center">
                                        <div className="text-center">
                                            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-(--surface) ring-1 ring-(--border)">
                                                <ImagePlus size={20} className="text-(--text-muted)" />
                                            </div>
                                            <div className="mt-3 text-xs font-semibold text-(--text-muted)">
                                                PNG/JPG up to 2MB
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileRef.current?.click()}
                            >
                                <ImagePlus size={16} /> Replace image
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setThumbnailFile(null)}
                                disabled={!thumbnailFile}
                            >
                                Undo
                            </Button>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onPickThumbnail}
                        />
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="space-y-3">
                        <Field label="Name">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Electronics"
                            />
                        </Field>

                        <Field label="Description" hint="Optional">
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short description of this category"
                            />
                        </Field>

                        <Field label="Status">
                            <Select
                                value={isActive}
                                onChange={(e) => setIsActive(e.target.value)}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </Select>
                        </Field>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={onSubmit} disabled={isLoading}>
                            {isLoading ? "Saving…" : "Save changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
