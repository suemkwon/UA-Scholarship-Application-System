import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import SchoolIcon from '@mui/icons-material/School';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { sha256 } from 'crypto-hash';


const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#ab0520', // primary color
    },
    secondary: {
      main: '#0c234b', // secondary color
    },
  },
});


export default function SignIn() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const password = data.get('password') as string;
      if (password !== null) {
        const hashedPassword = await sha256(password);
        console.log("Hashed Password", hashedPassword);

        const response = await axios.post('http://localhost:8000/login/', {
          username: data.get('username'),
          password: hashedPassword,
        });
        console.log(response.data);
        if (response.status === 200) {
          // storing the DB keys in session storage for the user / student
          for (const key in response.data) {
            sessionStorage.setItem(key, response.data[key]);
          }
          window.location.href = '/home';
        } else {
          // Display error message
          alert('Invalid username or password');
        }
      }
     
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div>
      <ThemeProvider theme={defaultTheme}>
        <div style={{height: '20vh'}}></div>
          <Container component="main" maxWidth="xs" 
            sx={{ 
              bgcolor: '#ffffff', 
              borderRadius: '10px',
              top: '20px' // Add margin top to move the container down
            }}
          >
          <CssBaseline />
          <Box
            sx={{
              // marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{height: '2vh'}}></div>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <SchoolIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              UASAMS
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <div style={{height: '2vh'}}></div>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
}