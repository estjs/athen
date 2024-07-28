import { useEditLink, useLocaleSiteData, usePrevNextPage } from '@theme-default/hooks';
import './index.scss';
import { usePageData } from '@/runtime';
const DocFooter = () => {
  const pageData = usePageData();
  const { siteData, relativePagePath, lastUpdatedTime } = pageData;
  const themeConfig = siteData?.themeConfig || {};
  const {
    editLink: rawEditLink,
    lastUpdatedText,
    prevPageText = 'Previous Page',
    nextPageText = 'Next page',
  } = useLocaleSiteData();
  const editLink = useEditLink(rawEditLink ?? themeConfig?.editLink, relativePagePath);

  const { prevPage, nextPage } = usePrevNextPage();

  return (
    <footer class="pager mt-8">
      <div class="xs:flex flex items-center justify-between p-b-5">
        {editLink ? (
          <a
            class="text-brand hover:text-brand-dark flex items-center text-sm font-medium leading-8 transition-colors duration-300"
            href={editLink.link}
          >
            {editLink.text}
          </a>
        ) : null}
        <div
          class="flex text-2 text-sm font-medium leading-6 sm:leading-8"
          style={{ 'white-space': 'pre-wrap' }}
        >
          <p>{`${lastUpdatedText ?? 'Last Updated'}: `}</p>
          <span>{lastUpdatedTime}</span>
        </div>
      </div>

      <div class="flex gap-2 border-t b-[var(--at-c-divider)] pt-6">
        <div class="prev w-1/2 flex flex-col">
          {prevPage && (
            <a
              href={prevPage.link}
              class="hover:border-brand block h-full w-full border b-[var(--at-c-divider)] rounded-lg border-solid p-2 transition-colors"
            >
              <span class="block text-sm text-gray-500 font-medium">{prevPageText}</span>
              <span class="text-brand hover:text-brand-dark block text-base font-medium transition-colors">
                {prevPage.text}
              </span>
            </a>
          )}
        </div>
        <div class="next w-1/2 flex flex-col">
          {nextPage && (
            <a
              href={nextPage.link}
              class="hover:border-brand ml-auto block h-full w-full border b-[var(--at-c-divider)] rounded-lg border-solid p-2 text-right transition-colors"
            >
              <span class="block text-sm text-gray-500 font-medium">{nextPageText}</span>
              <span class="text-brand hover:text-brand-dark block text-base font-medium transition-colors">
                {nextPage.text}
              </span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default DocFooter;
