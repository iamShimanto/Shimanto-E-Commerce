import { useState } from "react"

import { cn } from "../../lib/cn"
import Button from "./Button"
import Chip from "./Chip"

export default function TagInput({
    tags,
    onAdd,
    onRemove,
    placeholder = "Add tag and press Enter",
    className,
}) {
    const [value, setValue] = useState("")

    const addNow = () => {
        const trimmed = value.trim().replace(/^#/, "")
        if (!trimmed) return
        onAdd?.(trimmed)
        setValue("")
    }

    return (
        <div className={cn("rounded-2xl border border-(--border) bg-(--surface-2) p-3", className)}>
            <div className="flex flex-wrap gap-2">
                {(tags || []).map((t) => (
                    <Chip key={t} onRemove={() => onRemove?.(t)}>
                        #{t}
                    </Chip>
                ))}
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault()
                            addNow()
                        }
                    }}
                    placeholder={placeholder}
                    className="min-w-45 flex-1 bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addNow}>
                    Add
                </Button>
            </div>
        </div>
    )
}
