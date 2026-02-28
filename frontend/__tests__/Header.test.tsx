import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../src/components/layout/Header';
import { useStore } from '../src/store/useStore';
import '@testing-library/jest-dom';

// Mock the Zustand store entirely
// Notice that we have to mock both the default export (a hook)
// AND specific return values for its state map
jest.mock('../src/store/useStore', () => ({
  useStore: jest.fn(),
}));

// Mock API Client to prevent network errors in test logs
jest.mock('../src/lib/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} })
  }
}));

// Mock Next router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

beforeEach(() => {
  // Setup a default Zustand store return value
  (useStore as unknown as jest.Mock).mockReturnValue({
    cart: [],
    toggleCart: jest.fn(),
    user: null, 
    setLogout: jest.fn()
  });
});

describe('Header Component', () => {
  it('renders the branding logo', () => {
    render(<Header />);
    expect(screen.getByText('AÚRELYÑ')).toBeInTheDocument();
  });

  it('displays correct links for unauthenticated users', () => {
    render(<Header />);
    expect(screen.getAllByText('Shop')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Collections')[0]).toBeInTheDocument();
  });

  it('displays the user profile icon securely when authenticated', () => {
    (useStore as unknown as jest.Mock).mockReturnValue({
      cart: [],
      toggleCart: jest.fn(),
      // Simulate real user obj
      user: { role: 'CUSTOMER', email: 'test@example.com' }, 
      setLogout: jest.fn()
    });

    render(<Header />);
    // The link should render directing to /profile 
    // Usually we could check the href of the Link component or see if it renders smoothly
    const link = screen.getAllByRole('link').find(el => el.getAttribute('href') === '/profile');
    expect(link).toBeInTheDocument();
  });
});
