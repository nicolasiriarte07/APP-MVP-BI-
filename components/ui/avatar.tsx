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

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", square, fallback, src, alt, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false);
    const sizeClass = sizeMap[size];
    const shapeClass = square ? "rounded-[12px]" : "rounded-full";

    if (!src || imgError) {
      return (
        <div
          className={cn(
            "bg-[var(--secondary-200)] flex items-center justify-content:center object-cover",
            sizeClass,
            shapeClass,
            className
          )}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label={alt}
        >
          <span className="font-semibold text-[var(--secondary-600)]">
            {fallback || alt?.slice(0, 2).toUpperCase() || "?"}
          </span>
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("object-cover", sizeClass, shapeClass, className)}
        onError={() => setImgError(true)}
        {...props}
      />
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
          className="w-12 h-12 rounded-full bg-[var(--secondary-200)] flex items-center justify-center text-xs font-semibold text-[var(--secondary-600)]"
          style={{ marginLeft: "-10px", border: "2px solid white" }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
