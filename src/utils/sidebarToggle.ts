import { useSidebar } from "@/hooks/zustand";

export function SidebarToggle() {
  const sidebarStore = useSidebar.getState();
  useSidebar.setState({ isOpen: !sidebarStore.isOpen });
}
