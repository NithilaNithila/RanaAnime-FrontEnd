"use client";

import { useState } from "react";

const FALLBACK = "/placeholder-poster.svg";

export default function PosterImage({ src, alt, className, loading = "lazy", ...props }) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? FALLBACK : src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (!failed) setFailed(true);
      }}
      {...props}
    />
  );
}
