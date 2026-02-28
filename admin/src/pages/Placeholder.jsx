export default function Placeholder({ title, description }) {
    return (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-sm">
            <div className="text-lg font-extrabold tracking-tight">{title}</div>
            {description ? (
                <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                    {description}
                </div>
            ) : null}
            <div className="mt-6 rounded-2xl border border-dashed border-(--border) bg-(--surface-2) p-6 text-sm font-semibold text-(--text-muted)">
                Coming soon…
            </div>
        </div>
    )
}
