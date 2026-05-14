import { cn } from "@/lib/utils";

// ============================================================================
// Input Component
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// ============================================================================
// Select Component
// ============================================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
          "focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

// ============================================================================
// Textarea Component
// ============================================================================

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={cn(
          "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400 resize-y",
          "focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy",
          "disabled:cursor-not-allowed disabled:bg-gray-50",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}
