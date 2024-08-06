import type { MatchResultItem } from './logic/search';

export function SuggestionContent(props: {
  suggestion: MatchResultItem;
  query: string;
  isCurrent: boolean;
}) {
  const { suggestion, query } = props;

  const renderHeaderMatch = () => {
    if (suggestion.type === 'header') {
      const { header, headerHighlightIndex } = suggestion;
      const headerPrefix = header.slice(0, headerHighlightIndex);
      const headerSuffix = header.slice(headerHighlightIndex + props.query.length);
      return (
        <div class="font-medium">
          <span>{headerPrefix}</span>
          <span class="rounded-1 bg-brand-light px-0.8 py-0.4 text-text-1 lh-1">{props.query}</span>
          <span>{headerSuffix}</span>
        </div>
      );
    } else {
      return <div class="font-medium">{suggestion.header}</div>;
    }
  };

  const renderStatementMatch = () => {
    if (suggestion.type !== 'content') {
      return null;
    }
    const { statementHighlightIndex, statement } = suggestion;
    const statementPrefix = statement.slice(0, statementHighlightIndex);
    const statementSuffix = statement.slice(statementHighlightIndex + query.length);
    return (
      <div class="text-gray-light w-full text-sm font-normal">
        <span>{statementPrefix}</span>
        <span class="rounded-1 bg-brand-light px-0.8 py-0.4 text-text-1 lh-1">{query}</span>
        <span>{statementSuffix}</span>
      </div>
    );
  };

  return (
    <div
      class={`b-b-1 b-r-none b-border-default dark:bg-#333 p-x-3 p-y-2 hover:bg-[#f3f4f5] text-[#2c3e50] dark:text-#eee  duration-200 dark:hover:bg-black ${
        props.isCurrent ? 'bg-[#f3f4f5]' : 'bg-white'
      }`}
    >
      <div class="text-sm font-medium">{renderHeaderMatch()}</div>
      {suggestion.type === 'content' && renderStatementMatch()}
    </div>
  );
}
