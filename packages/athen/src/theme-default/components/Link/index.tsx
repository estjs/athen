import { useComputed } from 'essor';
import './style.scss';
import { EXTERNAL_URL_RE, withBase } from '@shared/utils';
import { useRouter } from 'essor-router';

const PageLink = ({ href, className, children, link }) => {
  const val = useComputed(() => {
    const isExternal = EXTERNAL_URL_RE.test(href);
    return {
      target: isExternal ? '_blank' : '',
      rel: isExternal ? 'noopener noreferrer' : undefined,
    };
  });

  const withBaseUrl = withBase(href) + (link ? '/' : '');

  const router = useRouter();
  const handleNavigate = e => {
    if (EXTERNAL_URL_RE.test(href)) {
      return;
    }
    e.preventDefault();
    router.push({
      path: withBaseUrl,
    });
  };

  return (
    <a
      href={withBaseUrl}
      key={href}
      onClick={handleNavigate}
      target={val.value.target}
      rel={val.value.rel}
      class={`at-link cursor-pointer ${className || ''}`}
    >
      {children}
    </a>
  );
};

export default PageLink;
