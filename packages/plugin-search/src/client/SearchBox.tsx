import { onDestroy, onMount, ref, signal } from 'essor';
import { usePageData, useRouter } from '@/runtime';
import type { SearchResult } from '../types';
import './style.css';

const SearchBox = () => {
  const query = signal('');
  const focused = signal(false);
  const loading = signal(false);
  const error = signal<Error | null>(null);
  const results = signal<SearchResult[]>([]);
  const inputRef = ref<HTMLInputElement>();
  const resultsPanelRef = ref<HTMLDivElement>();
  const selectedIndex = signal(-1);
  const pageData = usePageData();
  const router = useRouter();

  const fetchResults = async (searchQuery: string) => {
    debugger;
    if (!searchQuery.trim()) {
      results.value = [];
      return;
    }

    loading.set(true);
    error.set(null);

    try {
      console.log(pageData.siteData.base);

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
              // eslint-disable-next-line unicorn/prefer-string-slice
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
      selectedIndex.set(matches.length > 0 ? 0 : -1);
    } catch (error_) {
      console.error('Search error:', error_);
      error.set(error_ instanceof Error ? error_ : new Error('Unknown search error'));
      results.value = [];
    } finally {
      loading.set(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
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
  };
  const handleClickOutside = (e: MouseEvent) => {
    if (
      focused &&
      inputRef.value &&
      !inputRef.value.contains(e.target as Node) &&
      resultsPanelRef.value &&
      !resultsPanelRef.value.contains(e.target as Node)
    ) {
      focused.set(false);
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('click', handleClickOutside);
  });

  // Handle input change
  const handleInputChange = e => {
    debugger;
    const value = e.target.value;
    query.set(value);
    fetchResults(value);
  };

  return (
    <div class="athen-search-box">
      <div class="athen-search-input-container">
        <input
          ref={inputRef}
          type="text"
          class="athen-search-input"
          placeholder="Search docs..."
          value={query.value}
          onChange={handleInputChange}
          onFocus={() => focused.set(true)}
        />
        {query.value && (
          <button
            class="athen-search-clear"
            onClick={() => {
              query.set('');
              results.value = [];
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
        <kbd class="athen-search-key" title="Press / to search">
          /
        </kbd>
      </div>

      {focused && (
        <div ref={resultsPanelRef} class="athen-search-results">
          {loading ? (
            <div class="athen-search-loading">Loading...</div>
          ) : error ? (
            <div class="athen-search-error">{error.value?.message}</div>
          ) : results.value.length > 0 ? (
            <ul class="athen-search-result-list">
              {results.value.map((result, index) => (
                <li
                  key={result.path}
                  className={`athen-search-result-item ${index === selectedIndex.value ? 'selected' : ''}`}
                  onClick={() => {
                    router.push(`${pageData.siteData.base}${result.path}`);
                    focused.set(false);
                  }}
                  onMouseEnter={() => selectedIndex.set(index)}
                >
                  <div class="athen-search-result-title">{result.title}</div>
                  {result.content && (
                    <div class="athen-search-result-content">{result.content}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : query.value ? (
            <div class="athen-search-no-results">No results for "{query.value}"</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
