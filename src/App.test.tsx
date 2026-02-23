import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

vi.mock('/vite.svg', () => ({ default: '/vite.svg' }))

describe('App smoke test', () => {
  it('renders the default app heading', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /vite \+ react/i })).toBeInTheDocument()
  })
})
