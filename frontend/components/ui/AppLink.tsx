"use client";

import { useNavigationUI } from "@/state/navigation/navigation-context";
import Link, { type LinkProps } from "next/link";
import React from "react";

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function AppLink({ onClick, ...props }: Props) {
  const { start } = useNavigationUI();

  return (
    <Link
      {...props}
      onClick={(e) => {
        start(); // ✅ loader inmediato
        onClick?.(e);
      }}
    />
  );
}
