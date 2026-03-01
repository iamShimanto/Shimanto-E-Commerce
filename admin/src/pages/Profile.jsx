import { useEffect, useMemo, useRef, useState } from "react"
import { useToast } from "../hooks/useToast"
import { Camera, Mail, Phone, Shield } from "lucide-react"

import Button from "../components/ui/Button"
import Field from "../components/ui/Field"
import Input from "../components/ui/Input"
import Textarea from "../components/ui/Textarea"
import { useProfileQuery, useUpdateProfileMutation } from "../store/auth/authApi"

function initialsFromName(name) {
    if (!name) return "U"
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || "U"
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
    return (first + last).toUpperCase()
}

export default function Profile() {
    const toast = useToast()
    const { data: user, isLoading } = useProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
    })
    const [triggerUpdateProfile, { isLoading: isUpdating }] =
        useUpdateProfileMutation()

    const fileInputRef = useRef(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const [draft, setDraft] = useState(null)

    const isSaving = isUpdating

    const displayName = user?.fullName || "Admin"
    const initials = useMemo(() => initialsFromName(displayName), [displayName])

    const avatarPreviewUrl = useMemo(() => {
        if (!avatarFile) return null
        return URL.createObjectURL(avatarFile)
    }, [avatarFile])

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
        }
    }, [avatarPreviewUrl])

    const values = useMemo(() => {
        const base = {
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            address: user?.address || "",
        }

        return draft ? { ...base, ...draft } : base
    }, [draft, user?.address, user?.fullName, user?.phone])

    const setField = (key, value) => {
        setDraft((prev) => {
            const base = prev || {
                fullName: user?.fullName || "",
                phone: user?.phone || "",
                address: user?.address || "",
            }

            return { ...base, [key]: value }
        })
    }

    const onPickAvatar = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type?.startsWith("image/")) {
            toast.error("Invalid file", "Please select an image file")
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large", "Image must be under 2MB")
            return
        }

        setAvatarFile(file)
    }

    const hasChanges =
        (values.fullName || "") !== (user?.fullName || "") ||
        (values.phone || "") !== (user?.phone || "") ||
        (values.address || "") !== (user?.address || "") ||
        Boolean(avatarFile)

    const discard = () => {
        setDraft(null)
        setAvatarFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            await triggerUpdateProfile({
                fullName: values.fullName,
                phone: values.phone,
                address: values.address,
                avatar: avatarFile,
            }).unwrap()
            toast.success("Success","Profile updated")
            setAvatarFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } catch (error) {
            const message =
                error?.data?.message ||
                error?.data?.error ||
                (typeof error === "string" ? error : null) ||
                "Failed to update profile"
            toast.error("Update failed", message)
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm">
                <div className="text-lg font-extrabold tracking-tight">Profile</div>
                <div className="mt-1 text-sm font-semibold text-(--text-muted)">Loading…</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Profile</div>
                    <div className="text-sm font-semibold text-(--text-muted)">
                        Manage your account details and preferences.
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={discard}
                        disabled={isSaving || !hasChanges}
                    >
                        Discard
                    </Button>
                    <Button
                        size="sm"
                        type="submit"
                        form="profileForm"
                        disabled={isSaving || !hasChanges}
                    >
                        {isSaving ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {avatarPreviewUrl || user?.avatar ? (
                                <img
                                    src={avatarPreviewUrl || user?.avatar}
                                    alt={displayName}
                                    className="h-18 w-18 rounded-3xl object-cover ring-1 ring-(--border)"
                                />
                            ) : (
                                <div className="grid h-18 w-18 place-items-center rounded-3xl bg-(--surface-2) text-lg font-extrabold ring-1 ring-(--border)">
                                    {initials}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-2xl border border-(--border) bg-(--surface) text-(--text-muted) shadow-sm transition hover:bg-(--surface-2) hover:text-(--text)"
                                aria-label="Change profile photo"
                            >
                                <Camera size={18} />
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onPickAvatar}
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="truncate text-base font-extrabold tracking-tight">
                                {displayName}
                            </div>
                            <div className="truncate text-sm font-semibold text-(--text-muted)">
                                {user?.email || ""}
                            </div>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-1.5 text-xs font-extrabold text-(--text-muted)">
                                <Shield size={14} />
                                {String(user?.role || "admin").toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3">
                            <Mail size={16} className="text-(--text-muted)" />
                            <div className="min-w-0">
                                <div className="text-[11px] font-extrabold text-(--text-muted)">
                                    Email
                                </div>
                                <div className="truncate text-sm font-semibold">{user?.email || "—"}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3">
                            <Phone size={16} className="text-(--text-muted)" />
                            <div className="min-w-0">
                                <div className="text-[11px] font-extrabold text-(--text-muted)">
                                    Phone
                                </div>
                                <div className="truncate text-sm font-semibold">{user?.phone || "—"}</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface-2) p-4">
                            <div className="text-xs font-extrabold">Tips</div>
                            <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                                Use a clear profile photo and keep your contact info updated.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-extrabold">Account details</div>
                            <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                                These details are used across the admin dashboard.
                            </div>
                        </div>
                    </div>

                    <form id="profileForm" onSubmit={onSubmit} className="mt-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Full name">
                                <Input
                                    placeholder="Your name"
                                    value={values.fullName}
                                    onChange={(e) => setField("fullName", e.target.value)}
                                />
                            </Field>

                            <Field label="Email">
                                <Input value={user?.email || ""} disabled readOnly />
                            </Field>

                            <Field label="Phone">
                                <Input
                                    placeholder="e.g. 017XXXXXXXX"
                                    value={values.phone}
                                    onChange={(e) => setField("phone", e.target.value)}
                                />
                            </Field>

                            <Field label="Role">
                                <Input value={String(user?.role || "admin")} disabled readOnly />
                            </Field>
                        </div>

                        <div className="mt-4">
                            <Field label="Address">
                                <Textarea
                                    placeholder="Office / shipping address"
                                    value={values.address}
                                    onChange={(e) => setField("address", e.target.value)}
                                />
                            </Field>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3">
                            <div className="text-xs font-semibold text-(--text-muted)">
                                Changes are saved to your admin account profile.
                            </div>
                            <Button type="submit" size="sm" disabled={isSaving || !hasChanges}>
                                {isSaving ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
