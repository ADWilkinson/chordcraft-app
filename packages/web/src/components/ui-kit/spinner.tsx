import clsx from 'clsx';
import React from 'react';

export function Spinner({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-t-2 border-b-2 border-white',
        className
      )}
      {...props}
    />
  );
}
