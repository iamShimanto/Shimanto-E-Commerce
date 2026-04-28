import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  asCircle?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, asCircle = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        role="presentation"
        className={cn(
          "animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80",
          asCircle && "rounded-full",
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
