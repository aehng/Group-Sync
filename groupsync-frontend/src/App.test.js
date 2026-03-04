import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock react-router-dom to avoid ESM issues in Jest environment
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => React.createElement(React.Fragment, null, children),
    Route: ({ element }) => element || null,
    Link: ({ children }) => React.createElement('a', null, children),
    Navigate: ({ to }) => React.createElement('div', null, `Navigate:${to}`),
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn(),
  };
});

// Mock API client used by AuthContext to avoid importing ESM axios in tests
jest.mock('./api/client', () => ({
  api: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

import App from './App';

test('renders navigation with Dashboard link', () => {
  render(<App />);
  const linkElement = screen.getByText(/dashboard/i);
  expect(linkElement).toBeInTheDocument();
});
