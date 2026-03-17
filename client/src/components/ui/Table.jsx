import { useState, useMemo } from "react";

const Table = ({
    columns = [],
    data = [],
    emptyMessage = "No data available",
    isLoading = false,
    defaultPerPage = 10,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultPerPage);

    const totalPages = Math.ceil(data.length / perPage);
    const start = (currentPage - 1) * perPage;
    const end = Math.min(currentPage * perPage, data.length);
    const pageData = useMemo(() => data.slice(start, start + perPage), [data, currentPage, perPage]);

    const getPages = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = [1];
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const goPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setCurrentPage(p);
    };

    const handlePerPage = (val) => {
        setPerPage(Number(val));
        setCurrentPage(1);
    };

    const renderCell = (col, row) => col.render ? col.render(row) : row[col.key];

    return (
        <div className="w-full rounded-lg overflow-x-auto" style={{ border: "1px solid var(--border-light)", background: "var(--bg-primary)", boxShadow: "var(--shadow-sm)" }}>

            {/* Desktop Table — hidden on smallest screens via CSS */}
            <table className="w-full text-left text-sm hidden sm:table" style={{ borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--bg-tertiary)" }}>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={col.key || i} style={{ padding: "12px 18px", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan={columns.length} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</td></tr>
                    ) : pageData.length > 0 ? pageData.map((row, ri) => (
                        <tr key={row?.id || ri} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            {columns.map((col, ci) => (
                                <td key={col.key || ci} style={{ padding: "13px 18px", color: "var(--text-primary)" }}>
                                    {renderCell(col, row)}
                                </td>
                            ))}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>{emptyMessage}</td></tr>
                    )}
                </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="sm:hidden">
                {isLoading ? (
                    <p style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading...</p>
                ) : pageData.length > 0 ? pageData.map((row, ri) => (
                    <div key={row?.id || ri} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)" }}>
                        {columns.map((col, ci) => (
                            <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>{col.label}</span>
                                <span style={{ fontSize: "13px", color: "var(--text-primary)", textAlign: "right" }}>{renderCell(col, row)}</span>
                            </div>
                        ))}
                    </div>
                )) : (
                    <p style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>{emptyMessage}</p>
                )}
            </div>

            {/* Footer: per-page + info + pagination */}
            {data.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", padding: "12px 18px", borderTop: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                            Rows per page:
                            <select className="form-input" style={{ width: "auto", padding: "4px 8px", height: "32px" }} value={perPage} onChange={e => handlePerPage(e.target.value)}>
                                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{start + 1}–{end} of {data.length}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <PagBtn onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}>←</PagBtn>
                        {getPages().map((p, i) =>
                            p === "..." ? <span key={i} style={{ padding: "0 4px", color: "var(--text-muted)", fontSize: "13px" }}>…</span>
                                : <PagBtn key={i} active={p === currentPage} onClick={() => goPage(p)}>{p}</PagBtn>
                        )}
                        <PagBtn onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}>→</PagBtn>
                    </div>
                </div>
            )}
        </div>
    );
};

const PagBtn = ({ children, active, disabled, onClick }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            height: "32px", minWidth: "32px", padding: "0 8px",
            fontSize: "13px", borderRadius: "6px", cursor: disabled ? "not-allowed" : "pointer",
            border: "1px solid var(--border-light)",
            background: active ? "var(--brand-primary)" : "var(--bg-primary)",
            color: active ? "#fff" : "var(--text-primary)",
            fontWeight: active ? 500 : 400,
            opacity: disabled ? 0.35 : 1,
            transition: "background 0.12s, border-color 0.12s",
        }}
    >
        {children}
    </button>
);

export default Table;