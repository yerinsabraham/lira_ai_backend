import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '@/lib'

type GridProps<T extends ElementType = 'div'> = {
  as?: T
  columns?: string
  gap?: string
  minColumnSize?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

function Grid<T extends ElementType = 'div'>({
  as,
  columns,
  gap = 'var(--space-4)',
  minColumnSize,
  className,
  style,
  children,
  ...props
}: GridProps<T>) {
  const Component = as ?? 'div'
  const templateColumns =
    columns ?? (minColumnSize ? `repeat(auto-fit, minmax(${minColumnSize}, 1fr))` : undefined)

  return (
    <Component
      className={cn('grid', className)}
      style={{ gap, gridTemplateColumns: templateColumns, ...style }}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Grid, type GridProps }
