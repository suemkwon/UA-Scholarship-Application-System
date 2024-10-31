import * as React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { sha256 } from 'crypto-hash';


// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

type FormDataObject = {
  firstName: string;
  lastName: string;
  netID: string;
  userID: number,
  username: string;
  password: string;
  sec1Q: string;
  sec1A: string;
  sec2Q: string;
  sec2A: string;
  phone: number;
  email: string;
};

export default function SignUp() {
  const [secretq1, setsecretq1] = useState('');
  const [secretq2, setsecretq2] = useState('');
  const navigate = useNavigate();

  const handleSecretq1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setsecretq1(event.target.value)
  };
  const handleSecretq2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setsecretq2(event.target.value)
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formObject: FormDataObject = {} as FormDataObject;
    formData.forEach((value, key) => {
      const formKey = key as keyof FormDataObject;
      // Now TypeScript knows that formKey is a valid key of FormDataObject
      switch (formKey) {
        case 'userID':
          formObject[formKey] = parseInt(value as string, 10); // Parse string to integer
          break;
        case 'phone' :
          formObject[formKey] = parseInt(value as string, 10); // Parse string to integer
          break;
        default:
          formObject[formKey] = value as string;
          break;
      }
    });
    try {
      const response = await axios.post('http://localhost:8000/createuser/',{
        firstName: formObject.firstName,
        lastName: formObject.lastName,
        netID: formObject.netID,
        userID: formObject.userID,
        username: formObject.username,
        password: await sha256(formObject.password),
        sec1Q: formObject.sec1Q,
        sec1A: await sha256(formObject.sec1A),
        sec2Q: formObject.sec2Q,
        sec2A: await sha256(formObject.sec2A),
        phone: formObject.phone,
        email: formObject.email
      });
      console.log('API response:', response.data);
      navigate('/signin');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12} sm = {6}>
                <TextField
                  required
                  fullWidth
                  id="netID"
                  label="netID"
                  name="netID"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="sec1Q"
                  label="Secret question 1"
                  select
                  id="sec1Q"
                  value={secretq1}
                  onChange={handleSecretq1}
                >
                  <MenuItem value="What is your favorite color?">What is your favorite color?</MenuItem>
                  <MenuItem value="What is your mother's maiden name?">What is your mother's maiden name?</MenuItem>
                  <MenuItem value="What city were you born in?">What city were you born in?</MenuItem>
                  </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="sec1A"
                  label="Secret question 1 answer"
                  id="sec1A"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="sec2Q"
                  label="Secret question 2"
                  select
                  id="sec2Q"
                  value={secretq2}
                  onChange={handleSecretq2}
                >
                  <MenuItem value="What is your favorite book?">What is your favorite book?</MenuItem>
                  <MenuItem value="What was the name of your first pet?">What was the name of your first pet?</MenuItem>
                  <MenuItem value="What is the name of your childhood best friend?">What is the name of your childhood best friend?</MenuItem>
                  </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="sec2A"
                  label="Secret question 2 answer"
                  id="sec2A"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="phone"
                  label="Phone number"
                  id="phone"
                  type='number'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email address"
                  id="email"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
              <Link href="/signin" variant="body2">
                    {"Already have an account? Sign In"}
                  </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}