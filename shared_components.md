# Shared Components

## Overview

The GroupSync application uses a centralized **Shared Components Library** to ensure consistent UI behavior, styling, and accessibility across all teams. These components are designed to be **reusable**, **theme-driven**, and **easy to integrate** into any feature without duplicating logic or styles.

All shared components consume design tokens from `theme.css` and structural styles from `components.css`, ensuring a single source of truth for colors, fonts, spacing, and visual states.

---

## Design Philosophy

- **Single Design System**  
  All visual styling is derived from CSS variables defined in `theme.css`. Components never hard-code colors, fonts, or spacing values.

- **Separation of Concerns**  
  - `theme.css` → design tokens (colors, fonts, radii, shadows)  
  - `components.css` → structural and layout styles  
  - React components → behavior and state

- **Accessibility First**  
  Components use semantic HTML, focus rings, and ARIA attributes to support keyboard navigation and screen readers.

- **Team Reusability**  
  Any team can import shared components without needing to understand internal styling details.

---

## Folder Structure

```text
src/
 └─ components/
    └─ shared/
       ├─ Button.js
       ├─ Input.js
       ├─ Card.js
       ├─ Loading.js
       ├─ Error.js
       ├─ Success.js
       └─ index.js
```

---

## Usage

Shared components are exported through a barrel file and can be imported from a single location:

```js
import {
  Button,
  Input,
  Card,
  Loading,
  Error,
  Success
} from "../components/shared";
```

---

## Component Reference

### Button

A reusable button component with multiple variants and sizes.

**Props**
- `variant`: `"primary" | "secondary" | "danger" | "ghost"` (default: `"primary"`)
- `size`: `"sm" | "md" | "lg"` (default: `"md"`)
- `block`: `boolean` – full-width button
- `disabled`: `boolean`
- `onClick`: `function`
- `type`: `"button" | "submit" | "reset"`

**Example**
```jsx
<Button variant="primary">Save</Button>
<Button variant="danger" size="sm">Delete</Button>
<Button variant="ghost">Cancel</Button>
```

---

### Input

A form input component with built-in validation and helper text support.

**Props**
- `label`: `string`
- `name`: `string`
- `value`: `string`
- `onChange`: `function`
- `type`: `string` (default: `"text"`)
- `required`: `boolean`
- `disabled`: `boolean`
- `validationState`: `"default" | "error" | "success"`
- `helperText`: `string`
- `errorText`: `string`
- `successText`: `string`

**Example**
```jsx
<Input
  label="Email"
  name="email"
  value={email}
  onChange={handleChange}
  validationState="error"
  errorText="Please enter a valid email."
/>
```

---

### Card

A container component used to group related content.

**Props**
- `title`: `string`
- `subtitle`: `string`
- `compact`: `boolean`
- `children`: `ReactNode`

**Example**
```jsx
<Card title="Group Tasks" subtitle="This week">
  <p>No tasks due today.</p>
</Card>
```

---

### Loading

A visual loading indicator used during asynchronous operations.

**Props**
- `label`: `string` (default: `"Loading…"`)

**Example**
```jsx
{isLoading && <Loading label="Fetching data…" />}
```

---

### Error

Displays an error message to the user.

**Props**
- `title`: `string`
- `message`: `string`

**Example**
```jsx
<Error
  title="Failed to save"
  message="Please try again later."
/>
```

---

### Success

Displays a success confirmation message.

**Props**
- `title`: `string`
- `message`: `string`

**Example**
```jsx
<Success
  title="Saved!"
  message="Your changes have been successfully saved."
/>
```

---

## Styling & Theming

All shared components rely on the following global styles:

```js
import "./styles/theme.css";
import "./styles/components.css";
```

No component defines its own colors or spacing. This allows the entire application to be re-themed by modifying `theme.css` alone.

---

## Contribution Guidelines

- Do **not** add hard-coded colors or fonts to shared components.
- New shared components must:
  - Use existing design tokens
  - Follow established class naming conventions
  - Be exported through `shared/index.js`
  - Include documentation in this section

---

## Summary

The Shared Components Library provides a consistent, accessible, and scalable UI foundation for GroupSync. By centralizing common UI elements, teams can focus on feature development while maintaining a unified user experience.

