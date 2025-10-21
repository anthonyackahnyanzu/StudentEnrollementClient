# React Toolkit Overview

---

## What is Redux Toolkit?
Redux Toolkit is the official, recommended way to write Redux logic. It simplifies state management in React apps by providing tools and best practices for writing Redux code.

---

## Key Features
- **Simplified Redux setup**
- **Built-in utilities for common tasks**
- **Immutability and code safety**
- **Integration with TypeScript**

---

## Getting Started

### 1. Install Redux Toolkit and React-Redux
```shell
npm install @reduxjs/toolkit react-redux
```

### 2. Create a Redux Store
```typescript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```


### 3. Create a Slice
A slice contains the reducer logic and actions for a feature. It combines the reducer and action creators in one place.

**Parameters:**
- `name`: A string to identify the slice (used in action types).
- `initialState`: The starting state for this slice.
- `reducers`: An object with reducer functions. Each function defines how the state changes for a specific action.
- `extraReducers` (optional): Handle actions from other slices or async thunks.

**Example:**
```typescript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter', // slice name
  initialState: { value: 0 }, // initial state
  reducers: {
    increment: state => { state.value += 1; }, // action and reducer
    decrement: state => { state.value -= 1; },
    incrementByAmount: (state, action) => { state.value += action.payload; }, // action with payload
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```
Each reducer function receives the current state and the action. You can safely mutate state because Redux Toolkit uses Immer under the hood.

### 4. Provide the Store to React
```typescript
import { Provider } from 'react-redux';
import store from './store';

function App() {
  return (
    <Provider store={store}>
      {/* your components */}
    </Provider>
  );
}
```

### 5. Use Redux State and Actions in Components
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { increment } from './counterSlice';

function Counter() {
  const count = useSelector((state: any) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>Increment</button>
    </div>
  );
}
```

---

## Advanced Topics


### 1. Async Logic with createAsyncThunk
`createAsyncThunk` helps you handle async actions like API calls. It automatically generates action types for pending, fulfilled, and rejected states.

**Parameters:**
- `typePrefix`: A string to identify the action (e.g., 'data/fetch').
- `payloadCreator`: An async function that returns the data or throws an error.

**Example:**
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchData = createAsyncThunk(
  'data/fetch', // typePrefix
  async () => {
    const response = await fetch('/api/data');
    return response.json(); // returned value is the payload
  }
);
```
You can handle the different states (pending, fulfilled, rejected) in your slice using `extraReducers`.

### 2. Middleware and Custom Store Enhancers
- Add custom logic to Redux actions and state changes.

### 3. TypeScript Integration
- Redux Toolkit works seamlessly with TypeScript for type-safe state and actions.

---

## Useful Resources
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts)
- [React Redux Docs](https://react-redux.js.org/)
