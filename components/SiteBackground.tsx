"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useBlurBackground = pathname !== "/";

  return <div className={useBlurBackground ? "flex-1 site-background" : "flex-1"}>{children}</div>;
}
