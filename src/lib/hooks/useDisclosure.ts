"use client";

import { useState, useCallback } from "react";

interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Simple boolean disclosure helper for modals, dropdowns, drawers, etc.
 * Usage: const { isOpen, open, close } = useDisclosure();
 */
export function useDisclosure(initialState = false): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((s) => !s), []);
  return { isOpen, open, close, toggle };
}
