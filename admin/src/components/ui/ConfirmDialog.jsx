import { AlertTriangle } from "lucide-react"

import Modal from "./Modal"
import Button from "./Button"

export default function ConfirmDialog({
    open,
    title = "Confirm action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false,
}) {
    return (
        <Modal
            open={open}
            title={title}
            description="This action may be irreversible."
            onClose={loading ? undefined : onCancel}
        >
            <div className="mx-auto w-full max-w-xl space-y-5">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold">{message}</p>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
