import { useEffect, useMemo, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"

import { useToast } from "../../../hooks/useToast"

import Button from "../../../components/ui/Button"
import Field from "../../../components/ui/Field"
import Input from "../../../components/ui/Input"
import Modal from "../../../components/ui/Modal"
import Textarea from "../../../components/ui/Textarea"
import { useCreateCategoryMutation } from "../../../api/category/categoryApi"


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

export default function CategoryCreateModal({ open, onClose }) {
    const toast = useToast()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const fileRef = useRef(null)

    const [createCategory, { isLoading }] = useCreateCategoryMutation()

    const thumbnailPreviewUrl = useMemo(() => {
        if (!thumbnailFile) return ""
        return URL.createObjectURL(thumbnailFile)
    }, [thumbnailFile])

    useEffect(() => {
        return () => {
            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl)
        }
    }, [thumbnailPreviewUrl])

    const resetForm = () => {
        setName("")
        setDescription("")
        setThumbnailFile(null)
        if (fileRef.current) fileRef.current.value = ""
    }

    const handleClose = () => {
        onClose?.()
        resetForm()
    }

    const onPickThumbnail = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!validateImage(file, toast)) return
        setThumbnailFile(file)
    }

    const onSubmit = async () => {
        const trimmedName = name.trim()

        if (!trimmedName) {
            toast.error("Validation", "Category name is required")
            return
        }
        if (!thumbnailFile) {
            toast.error("Validation", "Thumbnail image is required")
            return
        }

        try {
            await createCategory({
                name: trimmedName,
                description: description.trim(),
                thumbnail: thumbnailFile,
            }).unwrap()

            toast.success("Created", "Category created successfully")
            handleClose()
        } catch (err) {
            const msg =
                err?.data?.message ||
                err?.data?.error ||
                err?.message ||
                "Failed to create category"
            toast.error("Create failed", msg)
        }
    }

    return (
        <Modal
            open={open}
            title="Create category"
            description="Add a new product category with a thumbnail image."
            onClose={handleClose}
        >
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <div className="rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                        <div className="text-xs font-extrabold text-(--text-muted)">Thumbnail</div>
                        <div className="mt-3 overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
                            <div className="relative aspect-4/3 w-full bg-(--surface-2)">
                                {thumbnailPreviewUrl ? (
                                    <img
                                        src={thumbnailPreviewUrl}
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
                                <ImagePlus size={16} /> Choose image
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setThumbnailFile(null)}
                                disabled={!thumbnailFile}
                            >
                                Remove
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
                            {isLoading ? "Creating…" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
