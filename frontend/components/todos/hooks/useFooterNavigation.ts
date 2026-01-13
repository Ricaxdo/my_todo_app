"use client";

import { useCallback, useState } from "react";

export function useFooterNavigation() {
  const [footerOpen, setFooterOpen] = useState(false);

  const openFooter = useCallback(() => setFooterOpen(true), []);
  const closeFooter = useCallback(() => setFooterOpen(false), []);

  return { footerOpen, openFooter, closeFooter };
}
