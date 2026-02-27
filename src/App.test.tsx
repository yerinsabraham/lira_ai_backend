import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App smoke test', () => {
  it('renders the sign-in form on the home page', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    // The login form should be visible when no credentials are stored
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
