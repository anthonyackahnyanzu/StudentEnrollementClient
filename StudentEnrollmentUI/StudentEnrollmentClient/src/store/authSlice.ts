import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


type LoginPayload = {
  username: string
  password: string
}

type RegisterPayload = {
  username: string
  email: string
  password: string
  roleId: number
}

type AuthState = {
  user: any | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: any | null
}

export const register = createAsyncThunk<any, RegisterPayload, { rejectValue: any }>(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        return rejectWithValue(data || { message: 'Failed to register' })
      }

      return data
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Network error' })
    }
  },
)

export const login = createAsyncThunk<any, LoginPayload, { rejectValue: any }>(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        return rejectWithValue(data || { message: 'Failed to login' })
      }

      return data
    } catch (err: any) {
      return rejectWithValue({ message: err.message || 'Network error' })
    }
  },
)

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(register.pending, (state: AuthState) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state: AuthState, action: any) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(register.rejected, (state: AuthState, action: any) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
      .addCase(login.pending, (state: AuthState) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state: AuthState, action: any) => {
        state.status = 'succeeded'
        state.user = action.payload
      })
      .addCase(login.rejected, (state: AuthState, action: any) => {
        state.status = 'failed'
        state.error = action.payload || action.error?.message
      })
  },
})

export default authSlice.reducer
