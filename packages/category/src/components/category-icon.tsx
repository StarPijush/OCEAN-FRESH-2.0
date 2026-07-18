interface CategoryIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function CategoryIcon({ size = 'md', className = '' }: CategoryIconProps) {
  return (
    <div className={`flex items-center justify-center rounded-md bg-gray-100 text-gray-400 ${sizeClasses[size]} ${className}`}>
      <svg className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  );
}
