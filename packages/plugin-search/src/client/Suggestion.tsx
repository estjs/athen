import { highlightText } from './utils';
import type { SearchResult } from '../types';

export interface SuggestionProps {
  result: SearchResult;
  query: string;
  isActive: boolean;
  onClick?: () => void;
}

function HighlightedText(props: { text: string; query: string }) {
  const highlight = highlightText(props.text, props.query);
  if (!highlight) return <span>{props.text}</span>;
  return (
    <span>
      <span>{highlight.prefix}</span>
      <span class="search-highlight">{highlight.match}</span>
      <span>{highlight.suffix}</span>
    </span>
  );
}

export function Suggestion(props: SuggestionProps) {
  const { result, query, isActive, onClick } = props;
  return (
    <li class={`result-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <a href={result.path} class="result-link">
        <div class="result-title">
          <HighlightedText text={result.title} query={query} />
        </div>
        {result.heading && (
          <div class="result-heading">
            <HighlightedText text={result.heading} query={query} />
          </div>
        )}
        {result.content && (
          <div class="result-content">
            <HighlightedText text={result.content} query={query} />
          </div>
        )}
      </a>
    </li>
  );
}

export default Suggestion;
