import { useSignal } from 'essor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePageData, useRouter } from '@/runtime';
import type { SearchResult } from '../types';
import './style.css';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const results = useSignal<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const pageData = usePageData();
  const router = useRouter();

  const fetchResults = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        results.value = [];
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${pageData.siteData.base}search-index.json`);
        if (!response.ok) {
          throw new Error('Failed to load search index');
        }

        const data = await response.json();
        const { documents } = data;

        // Simple local search implementation
        const matches: SearchResult[] = [];
        const lowerQuery = searchQuery.toLowerCase();

        for (const doc of documents) {
          const titleMatches = doc.title.toLowerCase().includes(lowerQuery);
          const contentMatches = doc.content.toLowerCase().includes(lowerQuery);
          const headingMatches = doc.headings.some(h => h.toLowerCase().includes(lowerQuery));

          if (titleMatches || contentMatches || headingMatches) {
            // Find excerpt if it's a content match
            let content = '';
            if (contentMatches) {
              const index = doc.content.toLowerCase().indexOf(lowerQuery);
              const start = Math.max(0, index - 40);
              const end = Math.min(doc.content.length, index + searchQuery.length + 40);

              content =
                (start > 0 ? '...' : '') +
                doc.content.substring(start, end) +
                (end < doc.content.length ? '...' : '');
            }

            matches.push({
              path: doc.path,
              title: doc.title,
              heading: doc.headings[0],
              content,
            });

            // Limit results
            if (matches.length >= 7) break;
          }
        }

        results.value = matches;
        setSelectedIndex(matches.length > 0 ? 0 : -1);
      } catch (error_) {
        console.error('Search error:', error_);
        setError(error_ instanceof Error ? error_ : new Error('Unknown search error'));
        results.value = [];
      } finally {
        setLoading(false);
      }
    },
    [pageData.siteData.base],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focused || results.value.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, results.value.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.value.length) {
            const result = results.value[selectedIndex];
            router.push(`${pageData.siteData.base}${result.path}`);
            setFocused(false);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setFocused(false);
          break;
      }
    },
    [focused, results.value, selectedIndex, router, pageData.siteData.base],
  );

  // Register keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        focused &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultsPanelRef.current &&
        !resultsPanelRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [focused]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchResults(value);
  };

  return (
    <div className="athen-search-box">
      <div className="athen-search-input-container">
        <input
          ref={inputRef}
          type="text"
          className="athen-search-input"
          placeholder="Search docs..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
        />
        {query && (
          <button
            className="athen-search-clear"
            onClick={() => {
              setQuery('');
              results.value = [];
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
        <kbd className="athen-search-key" title="Press / to search">
          /
        </kbd>
      </div>

      {focused && (
        <div ref={resultsPanelRef} className="athen-search-results">
          {loading ? (
            <div className="athen-search-loading">Loading...</div>
          ) : error ? (
            <div className="athen-search-error">{error.message}</div>
          ) : results.value.length > 0 ? (
            <ul className="athen-search-result-list">
              {results.value.map((result, index) => (
                <li
                  key={result.path}
                  className={`athen-search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    router.push(`${pageData.siteData.base}${result.path}`);
                    setFocused(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="athen-search-result-title">{result.title}</div>
                  {result.content && (
                    <div className="athen-search-result-content">{result.content}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="athen-search-no-results">No results for "{query}"</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
