'use client'

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  square?: boolean;
  fallback?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-20 h-20 text-lg",
};

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = "md", square, fallback, src, alt, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);
    const sizeClass = sizeMap[size];
    const shapeClass = square ? "rounded-[12px]" : "rounded-full";

    if (!src || imgError) {
      return (
        <span
          ref={ref}
          className={cn(
            "bg-muted flex items-center justify-center shrink-0 overflow-hidden",
            sizeClass,
            shapeClass,
            className
          )}
          aria-label={alt}
        >
          <span className="font-semibold text-muted-foreground text-inherit">
            {fallback || alt?.slice(0, 2).toUpperCase() || "?"}
          </span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn("relative inline-flex shrink-0 overflow-hidden", sizeClass, shapeClass, className)}
      >
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
          onError={() => setImgError(true)}
          {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarGroup = ({
  children,
  max = 3,
  className,
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) => {
  const childArray = React.Children.toArray(children);
  const visible = childArray.slice(0, max);
  const overflow = childArray.length - max;

  return (
    <div className={cn("flex items-center", className)} style={{ paddingLeft: "10px" }}>
      {visible.map((child, i) => (
        <div
          key={i}
          style={{ marginLeft: "-10px", border: "2px solid white", borderRadius: "9999px" }}
        >
          {child}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground"
          style={{ marginLeft: "-10px", border: "2px solid white" }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

// Radix-compatible primitives kept for any existing usage
function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarGroup, AvatarImage, AvatarFallback };
