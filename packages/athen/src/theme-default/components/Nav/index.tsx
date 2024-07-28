import './style.scss';

import { useLocaleSiteData } from '@theme-default/hooks';
import { Switch } from '../Switch';
import Search from '../Search';

const NavHeader = () => {
  const localeData = useLocaleSiteData();

  return (
    <header class="fixed left-0 top-0 z-10 w-full">
      <div class="nav h-14 flex items-center justify-between border-b b-[var(--at-c-divider)]">
        <div>
          <a
            href={localeData.langRoutePrefix || '/'}
            class="h-full w-full flex items-center text-xl font-semibold hover:opacity-60"
          >
            Athen
          </a>
        </div>

        <div class="search flex-1 pl-8">
          <Search langRoutePrefix={localeData.langRoutePrefix || ''} />
        </div>

        <div class="flex items-center">
          <div class="flex items-center">
            {(localeData?.nav || []).map(item => (
              <div class="mx-3 text-sm font-medium">
                <a href={item.link} class="link">
                  {item.text}
                </a>
              </div>
            ))}
          </div>
          <Switch />
          <div class="social-link-icon ml-2">
            <a href="/">
              <div class="i-carbon-logo-github h-5 w-5 fill-current"></div>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
