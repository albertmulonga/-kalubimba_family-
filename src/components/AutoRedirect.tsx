"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRedirect({ href, delay }: { href: string; delay: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace(href), delay);
    return () => window.clearTimeout(timer);
  }, [delay, href, router]);

  return null;
}
