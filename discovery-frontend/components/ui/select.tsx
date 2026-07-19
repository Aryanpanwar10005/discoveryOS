"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { useState, useRef, useEffect, createContext, useContext } from "react";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select component");
  }
  return context;
}

export function Select({
  value = "",
  onValueChange = () => {},
  children,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        isOpen,
        setIsOpen,
      }}
    >
      <div ref={ref} className="relative inline-block w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  className?: string;
  children?: ReactNode;
}

export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { isOpen, setIsOpen } = useSelectContext();

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition-all duration-150 hover:border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
      <svg
        className={cn(
          "h-4 w-4 text-ink-600 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

export function SelectValue({ placeholder = "Select an option", children }: SelectValueProps) {
  const { value } = useSelectContext();

  // If children are provided as a render prop function, use them
  if (children) {
    return <>{children}</>;
  }

  return <span>{value || placeholder}</span>;
}

interface SelectContentProps {
  className?: string;
  children?: ReactNode;
}

export function SelectContent({ className, children }: SelectContentProps) {
  const { isOpen } = useSelectContext();

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-ink-200 bg-white shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children?: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelectContext();
  const isSelected = value === selectedValue;

  return (
    <button
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={cn(
        "w-full px-3 py-2 text-left text-sm transition-colors duration-150",
        isSelected
          ? "bg-brand-50 text-brand-700 font-medium"
          : "text-ink-700 hover:bg-ink-50"
      )}
    >
      {children}
    </button>
  );
}
