import { useEditLink, useLocaleSiteData, usePrevNextPage } from '@theme-default/hooks';
import './index.scss';
import { usePageData } from '@/runtime';
const DocFooter = () => {
  const pageData = usePageData().value;
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
            class="flex items-center text-sm text-brand font-medium leading-8 transition-colors duration-300 hover:text-brand-dark"
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

      <div class="flex gap-2 border-t b-border-default pt-6">
        <div class="prev w-1/2 flex flex-col">
          {prevPage && (
            <a
              href={prevPage.link}
              class="block h-full w-full border b-border-default rounded-lg border-solid p-2 transition-colors hover:border-brand"
            >
              <span class="block text-sm text-gray-500 font-medium">{prevPageText}</span>
              <span class="block text-base text-brand font-medium transition-colors hover:text-brand-dark">
                {prevPage.text}
              </span>
            </a>
          )}
        </div>
        <div class="next w-1/2 flex flex-col">
          {nextPage && (
            <a
              href={nextPage.link}
              class="ml-auto block h-full w-full border b-border-default rounded-lg border-solid p-2 text-right transition-colors hover:border-brand"
            >
              <span class="block text-sm text-gray-500 font-medium">{nextPageText}</span>
              <span class="block text-base text-brand font-medium transition-colors hover:text-brand-dark">
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
