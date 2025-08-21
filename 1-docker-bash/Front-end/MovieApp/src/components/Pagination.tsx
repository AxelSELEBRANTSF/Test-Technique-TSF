// src/components/Pagination.tsx

type Props = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  pageSizeOptions?: number[];
};

export default function Pagination({
  page, pageSize, total, loading,
  onPageChange, onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: Props) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="gap-12" style={{ marginTop: 8, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <span className="badge">{pageSize} / page</span>
      <span className="small" style={{ opacity: 0.8 }}>{total} au total</span>
      <div className="space" />
      <div className="btn-group">
        <button className="btn" type="button" disabled={!!loading || page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
          ← Précédent
        </button>
        <button className="btn" type="button" disabled={!!loading || page >= lastPage} onClick={() => onPageChange(Math.min(lastPage, page + 1))}>
          Suivant →
        </button>
      </div>
      <span className="small">Page {page} / {lastPage}</span>
      <select
        className="form-input"
        value={pageSize}
        disabled={!!loading}
        onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
        title="Éléments par page"
      >
        {pageSizeOptions.map(n => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </div>
  );
}
