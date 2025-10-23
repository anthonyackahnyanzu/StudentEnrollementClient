import React, { useState } from 'react'
import { useAppDispatch } from '../hooks.ts'
import { register, login } from '../store/authSlice'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'


type AuthFormProps = {
  signupOpen?: boolean
  setSignupOpen?: (open: boolean) => void
  loginOpen?: boolean
  setLoginOpen?: (open: boolean) => void
  renderButtons?: boolean // if true, only render buttons (for header)
}

const AuthForm: React.FC<AuthFormProps> = ({
  signupOpen,
  setSignupOpen,
  loginOpen,
  setLoginOpen,
  renderButtons,
}) => {
  const dispatch = useAppDispatch()
  // If props provided, use them; else use local state (for legacy usage)
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [loginOpenLocal, setLoginOpenLocal] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Use props if provided, else local state
  const signupDialogOpen = typeof signupOpen === 'boolean' ? signupOpen : open
  const setSignupDialogOpen = setSignupOpen || setOpen
  const loginDialogOpen = typeof loginOpen === 'boolean' ? loginOpen : loginOpenLocal
  const setLoginDialogOpen = setLoginOpen || setLoginOpenLocal

  const handleOpen = () => setSignupDialogOpen(true)
  const handleClose = () => setSignupDialogOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const resultAction = await dispatch(
        register({ username, email, password, roleId }),
      )

      // @ts-ignore
      if (resultAction.error) {
        // @ts-ignore
        setError(resultAction.payload?.message || resultAction.error.message)
      } else {
        handleClose()
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Login dialog handlers
  const handleLoginOpen = () => setLoginDialogOpen(true)
  const handleLoginClose = () => setLoginDialogOpen(false)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const resultAction = await dispatch(
        login({ username: loginUsername, password: loginPassword })
      )
      // @ts-ignore
      if (resultAction.error) {
        // @ts-ignore
        setLoginError(resultAction.payload?.message || resultAction.error.message)
      } else {
        handleLoginClose()
      }
    } catch (err: any) {
      setLoginError(err.message || 'Unknown error')
    } finally {
      setLoginLoading(false)
    }
  }

  // If renderButtons, only render the buttons (for header)
  if (renderButtons) {
    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Sign up
        </Button>
        <Button variant="outlined" onClick={handleLoginOpen}>Login</Button>

        {/* Sign up dialog */}
        <Dialog open={signupDialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Sign up</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
              <TextField label="Username" value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} fullWidth required />
              <TextField label="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} fullWidth required />
              <TextField label="Role Id" type="number" value={roleId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoleId(Number(e.target.value))} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Login dialog */}
        <Dialog open={loginDialogOpen} onClose={handleLoginClose} fullWidth maxWidth="sm">
          <DialogTitle>Login</DialogTitle>
          <DialogContent>
            {loginError && <Alert severity="error">{loginError}</Alert>}
            <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
              <TextField label="Username" value={loginUsername} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginUsername(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={loginPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)} fullWidth required />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLoginClose}>Cancel</Button>
            <Button onClick={handleLoginSubmit} variant="contained" disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Login'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  // Legacy usage: render buttons and dialogs with local state
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Sign up
      </Button>
      <Button variant="outlined" onClick={() => setLoginOpenLocal(true)}>Login</Button>

      {/* Sign up dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Sign up</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField label="Username" value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} fullWidth required />
            <TextField label="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} fullWidth required />
            <TextField label="Role Id" type="number" value={roleId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoleId(Number(e.target.value))} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login dialog */}
      <Dialog open={loginOpenLocal} onClose={() => setLoginOpenLocal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          {loginError && <Alert severity="error">{loginError}</Alert>}
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField label="Username" value={loginUsername} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginUsername(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={loginPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)} fullWidth required />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginOpenLocal(false)}>Cancel</Button>
          <Button onClick={handleLoginSubmit} variant="contained" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Login'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AuthForm
