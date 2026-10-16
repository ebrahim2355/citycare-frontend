import type { ImageLoaderProps } from "next/image";

const UPLOAD_PATH = "/image/upload/";

export const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps) => {
  if (!src.startsWith("https://res.cloudinary.com/") || !src.includes(UPLOAD_PATH)) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }

  const [base, path] = src.split(UPLOAD_PATH);

  return `${base}${UPLOAD_PATH}f_auto,q_${quality ?? "auto"},c_limit,w_${width}/${path}`;
};
