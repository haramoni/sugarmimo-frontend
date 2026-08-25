import type { ReactNode } from "react";

import { AdminSidebar } from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
