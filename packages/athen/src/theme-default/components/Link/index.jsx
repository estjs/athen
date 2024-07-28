import { useComputed } from "essor";
import "./style.scss";
import {
  withBase
} from '@/runtime';
import { useRouter } from "essor-router";
import { EXTERNAL_URL_RE } from "@shared/utils";


const PageLink = ({ href, className, children }) => {
  const val = useComputed(() => {
    const isExternal = EXTERNAL_URL_RE.test(href);
    return {
      target: isExternal ? '_blank' : '',
      rel: isExternal ? 'noopener noreferrer' : undefined,
    };
  });
  const router = useRouter();

  const handleNavigate = (
    e
  ) => {
    e.preventDefault();
    const withBaseUrl = withBase(href);
    router.value.push({
      path: withBaseUrl,
    })
  };

  return (
    <a onClick={handleNavigate} target={val.value.target} rel={val.value.rel} class={`${className||""} link cursor-pointer`}>
      {children}
    </a>
  );
};

export default PageLink;
