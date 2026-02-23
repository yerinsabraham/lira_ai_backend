import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { cn } from '@/lib'

type ClusterProps<T extends ElementType = 'div'> = {
  as?: T
  gap?: string
  align?: string
  justify?: string
  wrap?: boolean
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

function Cluster<T extends ElementType = 'div'>({
  as,
  gap = 'var(--space-3)',
  align = 'center',
  justify = 'flex-start',
  wrap = true,
  className,
  style,
  children,
  ...props
}: ClusterProps<T>) {
  const Component = as ?? 'div'

  return (
    <Component
      className={cn('flex', className)}
      style={{
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

export { Cluster, type ClusterProps }
