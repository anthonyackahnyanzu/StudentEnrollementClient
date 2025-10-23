import React from 'react'
import './App.css'
import { useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import AuthForm from './features/AuthForm'
import { useState } from 'react'


const App: React.FC = () => {
  // For controlling AuthForm dialogs from header
  const [signupOpen, setSignupOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // Modern background pattern (CSS gradients)
  // Prevent scrollbars on body
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', overflow: 'hidden', background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1} sx={{ background: 'rgba(255,255,255,0.95)', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            Student Enrollment
          </Typography>
          <AuthForm
            signupOpen={signupOpen}
            setSignupOpen={setSignupOpen}
            loginOpen={loginOpen}
            setLoginOpen={setLoginOpen}
            renderButtons
          />
        </Toolbar>
      </AppBar>
      {/* Fullscreen main content, center card */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', minHeight: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            mx: 'auto',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 4,
            boxShadow: 3,
            px: { xs: 2, sm: 4 },
            py: { xs: 4, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
            maxHeight: 'calc(100vh - 80px)',
            overflow: 'auto',
          }}
        >
          <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
            Welcome!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please login or sign up to continue.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default App
