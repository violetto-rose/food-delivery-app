import { twMerge } from 'tailwind-merge';

export default function Button({
  children,
  type = 'button',
  size = 'medium',
  onClick,
  disabled = false,
  className = ''
}) {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  const buttonClasses = twMerge(
    'flex gap-2 items-center justify-center',
    'bg-red-500 text-white rounded-lg',
    'hover:bg-red-600',
    'cursor-pointer',
    'disabled:bg-gray-400 disabled:cursor-not-allowed',
    'transition-colors',
    sizeClass,
    className
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}>
      {children}
    </button>
  );
}
