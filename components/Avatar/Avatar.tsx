"use client";

interface AvatarProps {
  src: string;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 28, className = "" }: AvatarProps) {
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
