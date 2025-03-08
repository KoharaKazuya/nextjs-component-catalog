"use client";

import { useSearchParams } from "next/navigation";

export default function Preview() {
  const resource = useIframeResource();
  return (
    <iframe
      key={resource}
      src={resource ?? undefined}
      srcDoc={resource ? undefined : "Next.js Component Catalog"}
      style={{
        border: "solid 1px red",
        width: "100%",
        height: "100%",
        resize: "both",
        background: "#fff",
      }}
    />
  );
}

function useIframeResource() {
  const searchParams = useSearchParams();
  const resource = searchParams.get("resource");
  return resource;
}
