# GroupSync Frontend

React frontend for GroupSync, including messaging, groups dashboard, meetings, and tasks integration views.

## Tech Stack

- React + React Router
- Axios for API calls
- date-fns for date/time formatting
- Jest + React Testing Library for tests

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Start backend (from Team-Project root)

```bash
python manage.py runserver
```

### 3. Start frontend (from groupsync-frontend)

```bash
npm start
```

Frontend runs at http://localhost:3000 and backend API at http://localhost:8000.

## Scripts

- `npm start`: Run dev server
- `npm test`: Run tests
- `npm run build`: Create production build
- `npm run server`: Serve build using Express
- `npm run dev`: Build then serve production build locally

## Design System

The UI uses shared color and component patterns for consistency across auth, messaging, and workspace pages.

### Color intent

- Primary actions: blue tones (`#007bff`, `#0056b3` hover)
- Success feedback: green tones (`#d4edda`, `#155724`)
- Error feedback: red tones (`#ffebee`, `#b00020`)
- Neutral surfaces: light grays (`#f5f5f5`, `#f9f9f9`, `#ddd` borders)

### Typography and spacing

- Base font size is 14px–16px for readability
- Message metadata uses 11px–12px
- Repeated spacing units: 8px, 10px, 12px, 16px, 20px

### Interaction patterns

- Keyboard focus rings are visible on interactive controls
- Loading/error/success feedback is rendered inline in context
- Message board includes subtle entrance and hover transitions

## Shared Component Usage Guide

Shared components live in `src/components/shared` and are re-exported from `src/components/shared/index.js`.

### `Button`

```jsx
import { Button } from "../components/shared";

<Button variant="primary" size="md" onClick={handleClick}>Save</Button>
```

Props:

- `variant`: `primary | secondary | danger | ghost`
- `size`: `sm | md | lg`
- `block`: boolean full-width mode
- `type`: button type (`button`, `submit`)
- `disabled`: disables button and sets `aria-disabled`

### `Input`

```jsx
import { Input } from "../components/shared";

<Input
	label="Message"
	name="message"
	value={value}
	onChange={onChange}
	required
	validationState="error"
	errorText="Message is required"
/>
```

Props:

- `label`, `name`, `value`, `onChange`, `placeholder`, `type`
- `required`, `disabled`
- `validationState`: `default | error | success`
- `helperText`, `errorText`, `successText`

### `Card`

```jsx
import { Card } from "../components/shared";

<Card title="Team Updates" subtitle="Latest activity">...</Card>
```

Props:

- `title`, `subtitle`
- `compact`
- `className`, `style`
- `onClick`

## Messaging Components

- `MessageBoard`: orchestrates message loading, status notices, composer, and list container.
- `MessageList`: memoized rendering of message entries.
- `MessageBubble`: individual message card with relative + absolute timestamps.
- `MessageComposer`: controlled input + send action.

## Custom Hooks and Utilities

### `useMessages(groupId)`

Path: `src/hooks/useMessages.js`

Responsibilities:

- Initial fetch of group messages (`listGroupMessages`)
- Polling for updates (every 5 seconds)
- Optimistic send + rollback on failure
- Cursor pagination for older messages (`loadOlder`)

Return shape:

- `messages`
- `isLoading`
- `error`
- `sendMessage(content)`
- `loadOlder()`

Internal utility:

- `nowIso()`: helper for generating ISO timestamps for optimistic messages and mock data.

## Testing

Run all tests:

```bash
npm test -- --watchAll=false
```

Run focused messaging tests:

```bash
npm test -- --watchAll=false src/components/MessageBoard.test.js src/hooks/useMessages.test.js
```

## Deployment Notes

- Build artifact: `npm run build`
- Local production check: `npm run server`
- Ensure backend CORS allows your deployed frontend domain before production release.
