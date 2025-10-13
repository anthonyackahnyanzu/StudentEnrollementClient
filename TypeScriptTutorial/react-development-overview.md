# React Development Overview

---

## What is React?
React is a popular JavaScript library for building user interfaces, especially single-page applications. It lets you create reusable UI components and manage application state efficiently.

---

## Key Concepts

### 1. Components
- Components are the building blocks of React apps.
- They can be functional or class-based.
- Example:
  ```typescript
  function Welcome(props: { name: string }) {
    return <h1>Hello, {props.name}!</h1>;
  }
  ```

### 2. JSX
- JSX is a syntax extension that lets you write HTML-like code in JavaScript/TypeScript.
- Example:
  ```typescript
  const element = <div>Welcome to React!</div>;
  ```

### 3. Props
- Props are inputs to components, passed from parent to child.
- Example:
  ```typescript
  <Welcome name="Alice" />
  ```

### 4. State
- State is data managed within a component.
- Use the `useState` hook in functional components.
- Example:
  ```typescript
  import { useState } from "react";
  function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
  }
  ```


### 5. Lifecycle and Hooks
- **Class Component Lifecycle:**
  - Lifecycle methods let you run code at specific times in a component's life.
  - Common methods:
    - `componentDidMount`: Runs after the component is added to the DOM.
    - `componentDidUpdate`: Runs after the component updates.
    - `componentWillUnmount`: Runs before the component is removed.
  - Example:
    ```typescript
    import React from "react";
    class Timer extends React.Component {
      componentDidMount() {
        console.log("Timer started!");
      }
      componentWillUnmount() {
        console.log("Timer stopped!");
      }
      render() {
        return <div>Timer</div>;
      }
    }
    ```

- **Functional Component Hooks:**
  - Hooks let you use state and lifecycle features in functional components.
  - Common hooks:
    - `useState`: Add state to a function component.
    - `useEffect`: Run code after render (side effects).
    - `useRef`: Access and persist values across renders.
    - `useContext`: Share data across components.
  - Example:
    ```typescript
    import { useState, useEffect } from "react";
    function Timer() {
      const [seconds, setSeconds] = useState(0);
      useEffect(() => {
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval); // Cleanup on unmount
      }, []);
      return <div>Seconds: {seconds}</div>;
    }
    ```

---

---

## Project Structure
- `src/` contains your components, styles, and logic.
- `public/` contains static files like `index.html`.
- `package.json` manages dependencies and scripts.

---

## Development Workflow
1. Start the development server:
   ```shell
   npm start
   ```
2. Edit `.tsx` files in `src/` to build your UI.
3. Use hot reloading to see changes instantly.
4. Install packages as needed:
   ```shell
   npm install <package-name>
   ```
5. Build for production:
   ```shell
   npm run build
   ```

---



## State Management: Redux and Redux Toolkit

### Why Use Redux?
- As React apps grow, managing state across many components becomes complex.
- Redux provides a predictable way to manage global state, making debugging and testing easier.
- It centralizes state, so data flows in one direction and is easier to track.

### Classic Redux Example
Redux has three main parts: the store, actions, and reducers.
```typescript
// Action
const increment = { type: 'INCREMENT' };

// Reducer
function counter(state = 0, action: any) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    default:
      return state;
  }
}

// Store
import { createStore } from 'redux';
const store = createStore(counter);

store.dispatch(increment);
console.log(store.getState()); // 1
```
Classic Redux requires a lot of boilerplate code for actions and reducers.

### Why Redux Toolkit?
- Redux Toolkit simplifies Redux setup and reduces boilerplate.
- It provides utilities for creating slices, async logic, and more.
- We will use Redux Toolkit for modern React state management.

---

### 1. Context API
- Share global data (like themes or user info) without prop drilling.
- Example:
  ```typescript
  import { createContext, useContext } from "react";
  const ThemeContext = createContext("light");
  function ThemedButton() {
    const theme = useContext(ThemeContext);
    return <button className={theme}>Click me</button>;
  }
  ```

### 2. Custom Hooks
- Create reusable logic for your components.
- Example:
  ```typescript
  import { useState, useEffect } from "react";
  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
  }
  ```

### 3. Performance Optimization
- Use `React.memo` to prevent unnecessary re-renders.
- Use `useCallback` and `useMemo` to memoize functions and values.

### 4. Error Boundaries
- Catch JavaScript errors in components and display fallback UI.
- Only available in class components.
- Example:
  ```typescript
  import React from "react";
  class ErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error: any, info: any) {
      // Log error
    }
    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }
      return this.props.children;
    }
  }
  ```

### 5. Testing React Components
- Use tools like Jest and React Testing Library for unit and integration tests.

---

## Useful Resources
- [React Official Docs](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- Community: Stack Overflow, Discord, GitHub
