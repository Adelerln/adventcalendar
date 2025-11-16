"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // N'utilise pas le fond vert sur la page d'accueil et la page dashboard
  const useBlurBackground = pathname !== "/" && pathname !== "/dashboard";

  return <div className={useBlurBackground ? "flex-1 site-background" : "flex-1"}>{children}</div>;
}
