import type { ComponentProps, ReactNode } from 'react'

import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
} & Omit<ComponentProps<typeof TooltipContent>, 'children'>

function HoverTooltip({ children, content, ...contentProps }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent {...contentProps}>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export { HoverTooltip }
