/* ─────────────────────────────────────────────────────────────
   POST SKELETON LOADERS
───────────────────────────────────────────────────────────── */
export function CardSkeleton() {
    return (
        <div className="pg-card pg-card--skeleton">
            <div className="pg-card-cover pg-skel" />
            <div className="pg-card-body">
                <div className="pg-skel pg-skel--tag" />
                <div className="pg-skel pg-skel--title" />
                <div className="pg-skel pg-skel--text" />
                <div className="pg-skel pg-skel--text pg-skel--short" />
            </div>
            <div className="pg-card-footer">
                <div className="pg-skel pg-skel--author" />
                <div className="pg-skel pg-skel--meta" />
            </div>
        </div>
    );
}

export function RowSkeleton() {
    return (
        <div className="pg-row pg-row--skeleton">
            <div className="pg-row-thumb pg-skel" />
            <div className="pg-row-info" style={{ gap: 8 }}>
                <div className="pg-skel pg-skel--tag" style={{ width: 80 }} />
                <div className="pg-skel pg-skel--title" style={{ width: "60%" }} />
                <div className="pg-skel pg-skel--text" />
            </div>
        </div>
    );
}