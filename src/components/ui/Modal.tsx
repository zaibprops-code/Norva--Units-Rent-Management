// =============================================================================
// MODAL / DIALOG — Accessible modal with confirm variant
// =============================================================================
"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      handleClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [handleClose]);

  // Close on backdrop click
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { clientX, clientY } = e;
    const isOutside =
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom;
    if (isOutside) handleClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className={cn(
        "m-auto w-full rounded-2xl border border-gray-200 bg-white p-0 shadow-xl",
        "backdrop:bg-black/40 backdrop:backdrop-blur-sm",
        "open:animate-fade-in",
        SIZE_CLASSES[size],
        className
      )}
    >
      {(title || description) && (
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="ml-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}

// -----------------------------------------------------------------------------
// Confirm Modal — for destructive or approval actions
// -----------------------------------------------------------------------------
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-3 flex h-11 w-11 items-center justify-center rounded-full",
            variant === "danger" ? "bg-red-100" : "bg-navy-100"
          )}
        >
          <AlertTriangle
            size={20}
            className={variant === "danger" ? "text-red-600" : "text-navy-700"}
          />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        <div className="mt-5 flex w-full gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
