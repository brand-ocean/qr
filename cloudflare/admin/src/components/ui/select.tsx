// Small styled native <select>, mirroring the forz AppSelect API so the
// roadmap/quick-capture call sites stay tiny. A native select keeps this
// dependency-free and fully accessible.
import { cx, focusInput } from '../../lib/utils';

export type AppSelectOption<T extends string> = {
  value: T;
  label: string;
};

export function AppSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  'aria-label': ariaLabel,
}: {
  value: T | null;
  onValueChange: (value: T | null) => void;
  options: AppSelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      disabled={disabled}
      value={value ?? ''}
      onChange={(e) => {
        const next = e.target.value;
        onValueChange(next === '' ? null : (next as T));
      }}
      className={cx(
        'block h-9 w-full appearance-none rounded-md border bg-white px-2.5 py-2 pr-8 shadow-sm transition outline-none sm:text-sm',
        'border-gray-300 dark:border-gray-800',
        'text-gray-900 dark:text-gray-50',
        'dark:bg-gray-950',
        'disabled:cursor-not-allowed disabled:opacity-60',
        // Chevron via background image so it works without extra markup.
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M8%209l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat",
        ...focusInput,
        className,
      )}
    >
      {placeholder !== undefined ? (
        <option value="">{placeholder}</option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
