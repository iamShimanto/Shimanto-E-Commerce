export function Panel({ title, subtitle, children, action }) {
    return (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-extrabold">{title}</div>
                    {subtitle ? (
                        <div className="mt-1 text-xs font-semibold text-(--text-muted)">{subtitle}</div>
                    ) : null}
                </div>
                {action ? <div>{action}</div> : null}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    )
}