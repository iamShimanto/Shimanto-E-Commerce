"use client";

import React from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

type PaginationItem = number | "ellipsis";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  className?: string;
  navClassName?: string;
  listClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  disabledButtonClassName?: string;
  pageLabel?: (page: number) => string;
  firstLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  lastLabel?: string;
  ariaLabel?: string;
}

const DEFAULT_SIBLING_COUNT = 1;
const DEFAULT_BOUNDARY_COUNT = 1;

function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => start + index);
}

function clampPage(page: number, totalPages: number) {
  if (totalPages <= 0) {
    return 1;
  }

  return Math.min(Math.max(1, page), totalPages);
}

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] {
  const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(
    currentPage - siblingCount,
    boundaryCount + 1,
  );
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages - boundaryCount,
  );
  const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2;
  const shouldShowRightEllipsis =
    rightSiblingIndex < totalPages - boundaryCount - 1;

  const firstPages = range(1, boundaryCount);
  const lastPages = range(totalPages - boundaryCount + 1, totalPages);

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = boundaryCount + siblingCount * 2 + 2;
    return [...range(1, leftItemCount), "ellipsis", ...lastPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = boundaryCount + siblingCount * 2 + 2;
    return [
      ...firstPages,
      "ellipsis",
      ...range(totalPages - rightItemCount + 1, totalPages),
    ];
  }

  return [
    ...firstPages,
    "ellipsis",
    ...range(leftSiblingIndex, rightSiblingIndex),
    "ellipsis",
    ...lastPages,
  ];
}

function PaginationButton({
  children,
  label,
  disabled,
  active,
  onClick,
  className,
  activeClassName,
  disabledClassName,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  className?: string;
  activeClassName?: string;
  disabledClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/10 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-slate-50/10",
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-slate-50 dark:bg-slate-50 dark:text-slate-950"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900",
        active && activeClassName,
        disabled && disabledClassName,
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = DEFAULT_SIBLING_COUNT,
  boundaryCount = DEFAULT_BOUNDARY_COUNT,
  showFirstLast = true,
  showPrevNext = true,
  className,
  navClassName,
  listClassName,
  buttonClassName,
  activeButtonClassName,
  disabledButtonClassName,
  pageLabel = (page) => `Go to page ${page}`,
  firstLabel = "First page",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  lastLabel = "Last page",
  ariaLabel = "Pagination",
}: PaginationProps) {
  const safeTotalPages = Math.max(1, Math.floor(totalPages));
  const safeCurrentPage = clampPage(currentPage, safeTotalPages);
  const items = React.useMemo(
    () =>
      buildPaginationItems(
        safeCurrentPage,
        safeTotalPages,
        siblingCount,
        boundaryCount,
      ),
    [safeCurrentPage, safeTotalPages, siblingCount, boundaryCount],
  );

  const canGoPrevious = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < safeTotalPages;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "flex w-full items-center justify-center",
        navClassName,
        className,
      )}
    >
      <ul className={cn("flex flex-wrap items-center gap-2", listClassName)}>
        {showFirstLast ? (
          <li>
            <PaginationButton
              label={firstLabel}
              disabled={!canGoPrevious}
              onClick={() => onPageChange(1)}
              className={buttonClassName}
              activeClassName={activeButtonClassName}
              disabledClassName={disabledButtonClassName}
            >
              <FiChevronsLeft className="h-4 w-4" />
            </PaginationButton>
          </li>
        ) : null}

        {showPrevNext ? (
          <li>
            <PaginationButton
              label={previousLabel}
              disabled={!canGoPrevious}
              onClick={() => onPageChange(safeCurrentPage - 1)}
              className={buttonClassName}
              activeClassName={activeButtonClassName}
              disabledClassName={disabledButtonClassName}
            >
              <FiChevronLeft className="h-4 w-4" />
            </PaginationButton>
          </li>
        ) : null}

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden="true">
              <span className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-slate-400 dark:text-slate-500">
                &hellip;
              </span>
            </li>
          ) : (
            <li key={item}>
              <PaginationButton
                label={pageLabel(item)}
                active={item === safeCurrentPage}
                onClick={() => onPageChange(item)}
                className={buttonClassName}
                activeClassName={activeButtonClassName}
                disabledClassName={disabledButtonClassName}
              >
                {item}
              </PaginationButton>
            </li>
          ),
        )}

        {showPrevNext ? (
          <li>
            <PaginationButton
              label={nextLabel}
              disabled={!canGoNext}
              onClick={() => onPageChange(safeCurrentPage + 1)}
              className={buttonClassName}
              activeClassName={activeButtonClassName}
              disabledClassName={disabledButtonClassName}
            >
              <FiChevronRight className="h-4 w-4" />
            </PaginationButton>
          </li>
        ) : null}

        {showFirstLast ? (
          <li>
            <PaginationButton
              label={lastLabel}
              disabled={!canGoNext}
              onClick={() => onPageChange(safeTotalPages)}
              className={buttonClassName}
              activeClassName={activeButtonClassName}
              disabledClassName={disabledButtonClassName}
            >
              <FiChevronsRight className="h-4 w-4" />
            </PaginationButton>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
