import { computed, onDestroy, onMount, ref, signal } from 'essor';
import './index.scss';
import { type MatchResultItem, PageSearcher } from './logic/search';
import { SuggestionContent } from './Suggestion';

const KEY_CODE = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ENTER: 'Enter',
  SEARCH: 'KeyK',
};

export function Search(props: { langRoutePrefix: string }) {
  const query = signal('');
  const suggestions = signal<MatchResultItem[]>([]);
  const initialized = signal(false);
  const searching = signal(false);
  const focused = signal(false);
  const currentSuggestionIndex = signal(-1);
  const psRef = ref<PageSearcher>();
  const searchInputRef = ref<HTMLInputElement | null>();
  const showLoading = computed(() => !initialized.value || searching.value);

  const initPageSearcher = async () => {
    if (!psRef.value) {
      psRef.value = new PageSearcher(props.langRoutePrefix);
      await psRef.value.init();
      initialized.value = true;
    } else {
      initialized.value = true;
    }
  };

  const onQueryChanged = async value => {
    if (!initialized.value) {
      await initPageSearcher();
    }
    query.value = value;
    searching.value = true;
    const matched = await psRef.value!.match(value);
    suggestions.value = matched;
    searching.value = false;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case KEY_CODE.SEARCH:
        if ((e.ctrlKey || e.metaKey) && searchInputRef.value) {
          e.preventDefault();
          if (!focused.value) {
            focused.value = true;
            searchInputRef.value.focus();
          } else {
            focused.value = false;
            searchInputRef.value.blur();
          }
        }
        break;
      case KEY_CODE.ARROW_DOWN:
        e.preventDefault();
        currentSuggestionIndex.value =
          (currentSuggestionIndex.value + 1) % suggestions.value.length;
        break;
      case KEY_CODE.ARROW_UP:
        e.preventDefault();
        currentSuggestionIndex.value =
          (currentSuggestionIndex.value - 1 + suggestions.value.length) % suggestions.value.length;
        break;
      case KEY_CODE.ENTER:
        if (currentSuggestionIndex.value >= 0) {
          const suggestion = suggestions.value[currentSuggestionIndex.value];
          window.location.href = suggestion.link;
        }
        break;
      default:
        break;
    }
  };

  onMount(() => {
    document.addEventListener('keydown', onKeyDown);
  });
  onDestroy(() => {
    document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div class="relative mr-2 flex items-center font-semibold">
      <span
        class="i-carbon-search h-5 w-5 fill-current"
        onClick={() => {
          focused.value = true;
          searchInputRef.value?.focus();
        }}
      />
      <input
        class={`searchInput h-8 cursor-text rounded-sm border-none p-b-0 p-l-2 p-r-2 p-t-0 text-sm transition-all duration-200 ease `}
        placeholder="Search"
        aria-label="Search"
        autocomplete="off"
        bind:value={query.value}
        autofocus={true}
        updateValue={onQueryChanged}
        onBlur={() => setTimeout(() => (focused.value = false), 200)}
        onFocus={() => {
          focused.value = true;
        }}
        ref={searchInputRef}
      />
      <div class="searchCommand mr-3 h-6 w-10 flex items-center justify-around border border-gray-light-3 rounded-md b-solid px-1.5 text-xs text-gray-light-3">
        <span>⌘</span>
        <span>K</span>
      </div>
      {focused.value && (
        <ul class="fixed left-0 top-10 z-60 w-100% list-none of-hidden border-1 b-border-default rounded-md b-solid bg-white shadow-sm sm:absolute sm:max-w-700px sm:min-w-500px dark:bg-#1e1e1e">
          {/* Show the suggestions */}
          {suggestions.value.map((item, index) => (
            <li key={item.title} class="w-100% border-collapse cursor-pointer rounded-sm">
              <a href={item.link} class="block whitespace-normal">
                <div class="w-100% table border-collapse">
                  <div class="divider-default w-35% table-cell border-b-1 border-r-1 border-t-1 border-none bg-#f5f5f5 p-1.2 text-right align-middle text-sm font-semibold dark:bg-#222">
                    {item.title}
                  </div>
                  <SuggestionContent
                    suggestion={item}
                    query={query.value}
                    isCurrent={index === currentSuggestionIndex.value}
                  />
                </div>
              </a>
            </li>
          ))}
          {/* Show the not found info */}
          {!showLoading.value && suggestions.value.length === 0 && (
            <li class="flex justify-center">
              <div class="p-2 text-sm text-[#2c3e50] dark:text-white">No results found</div>
            </li>
          )}
          {/* Show the loading info */}
          {showLoading.value && (
            <li class="flex justify-center">
              <div class="p-2 text-sm">Loading...</div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default Search;
