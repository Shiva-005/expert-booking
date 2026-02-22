import { useState, useEffect, useCallback } from 'react';
import ExpertCard from '../components/ExpertCard';
import { useExperts } from '../hooks/useData';

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Education', 'Legal'];

export default function ExpertListPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { experts, pagination, loading, error, fetchExperts } = useExperts();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    fetchExperts({ page, limit: 6, category, search: debouncedSearch });
  }, [page, category, debouncedSearch, fetchExperts]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [category, debouncedSearch]);

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
    return (
      <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
        {pages.map((p) => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        <button className="page-btn" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Your Expert</h1>
        <p className="page-subtitle">Book 1-on-1 sessions with world-class professionals</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {pagination && (
        <p className="results-count">
          {pagination.total} expert{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {loading && (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Finding experts...</span>
        </div>
      )}

      {error && <div className="error-wrap">⚠ {error}</div>}

      {!loading && !error && experts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No experts found</div>
          <p>Try adjusting your search or filter</p>
        </div>
      )}

      {!loading && !error && experts.length > 0 && (
        <>
          <div className="experts-grid">
            {experts.map((expert) => <ExpertCard key={expert._id} expert={expert} />)}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
