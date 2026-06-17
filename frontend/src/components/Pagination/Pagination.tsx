import './Pagination.css';

interface Props {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total, limit, onChange }: Props) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="pagination-info">{from}–{to} / {total}</span>
      <div className="pagination-btns">
        <button
          className="btn btn-ghost btn-sm"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          &lsaquo;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | string)[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="pagination-dots">...</span>
            ) : (
              <button
                key={p}
                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onChange(p as number)}
              >
                {p}
              </button>
            )
          )}
        <button
          className="btn btn-ghost btn-sm"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );
}
