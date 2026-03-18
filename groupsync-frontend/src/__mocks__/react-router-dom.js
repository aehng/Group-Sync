const React = require('react');

module.exports = {
  BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  Route: ({ element }) => element || null,
  Link: ({ children }) => React.createElement('a', null, children),
  Navigate: ({ to }) => React.createElement('div', null, `Navigate:${to}`),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => () => {},
};
