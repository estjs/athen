import { signal } from 'essor';

/**
 * Shared signal controlling whether the mobile sidebar drawer is open.
 *
 * The Nav hamburger toggles it, the Sidebar backdrop closes it, and
 * SideBar items close it when navigated. Using a module-level signal
 * instead of `document.querySelector('.sidebar').classList.toggle(...)`
 * keeps the DOM and the framework state in sync.
 */
export const sidebarOpen = signal(false);

export function openSidebar() {
  sidebarOpen.value = true;
}

export function closeSidebar() {
  sidebarOpen.value = false;
}

export function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
