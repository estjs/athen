import { computed } from 'essor';
import './style.scss';
import { EXTERNAL_URL_RE, withBase } from '@shared/utils';
import { useRouter } from 'essor-router';

const PageLink = ({
  href,
  className,
  children,
  link,
}: {
  href?: string;
  className?: string;
  children?: string;
  link?: boolean;
}) => {
  const val = computed(() => {
    const isExternal = EXTERNAL_URL_RE.test(href || '');
    return {
      target: isExternal ? '_blank' : '',
      rel: isExternal ? 'noopener noreferrer' : undefined,
    };
  });

  const withBaseUrl = computed(() => {
    return withBase(href) + (link ? '/' : '');
  });

  const router = useRouter();
  const handleNavigate = e => {
    if (!href || EXTERNAL_URL_RE.test(href)) {
      return;
    }
    e.preventDefault();
    router.push(withBaseUrl.value);
  };

  return (
    <a
      href={withBaseUrl.value}
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
