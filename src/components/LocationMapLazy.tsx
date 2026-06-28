"use client";

import dynamic from "next/dynamic";

export const LocationMapLazy = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-44 w-full bg-add-slot animate-pulse" />
  ),
});
