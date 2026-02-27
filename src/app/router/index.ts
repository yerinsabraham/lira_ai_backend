export const ROUTES = {
  home: '/',
  meeting: '/meeting',
  uiLab: '/ui-lab',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
