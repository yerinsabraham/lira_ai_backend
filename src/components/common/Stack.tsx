import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '@/lib'

type StackProps<T extends ElementType = 'div'> = {
  as?: T
  gap?: string
  align?: string
  justify?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

function Stack<T extends ElementType = 'div'>({
  as,
  gap = 'var(--space-4)',
  align,
  justify,
  className,
  style,
  children,
  ...props
}: StackProps<T>) {
  const Component = as ?? 'div'

  return (
    <Component
      className={cn('flex flex-col', className)}
      style={{ gap, alignItems: align, justifyContent: justify, ...style }}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Stack, type StackProps }
