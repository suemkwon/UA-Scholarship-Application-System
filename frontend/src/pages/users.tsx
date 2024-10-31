import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiTable from './mui-components/muitableusers';    
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';

const defaultTheme = createTheme();

export default function Users() {
  const [open, setOpen] = React.useState(true);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [type, setType] = React.useState('');
  const [phonenumber, setPhonenumber] = React.useState('');
  const [email, setEmail] = React.useState('');

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

 const constructFilter = () => {
    let filter = '';
    if (name) filter += `name=${name}&`;
    if (username) filter += `username=${username}&`;
    if (type) filter += `type=${type}&`;
    if (phonenumber) filter += `phonenumber=${phonenumber}&`;
    if (email) filter += `email=${email}&`;
    
    // Remove the trailing '&' if it exists
    return filter.endsWith('&') ? filter.slice(0, -1) : filter;
  };

 return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box style={{ width: '100%', height: '100vh' }}>
          <h1 style={{ textAlign: 'center' }}>Users</h1>
          <TextField 
            label="Search Users" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            sx={{ width: '100%', marginBottom: '20px' }} 
          />
          <Button 
            onClick={toggleFilter}
            sx={{ 
                backgroundColor: '#ab0520', 
                color: 'white', 
                marginBottom: '30px',
                '&:hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color here
                },
            }}>
            {filterVisible ? 'Hide Filters' : 'Show Filters'}
          </Button> 
          {filterVisible && (
            <Grid container spacing={2} style={{marginBottom: '20px', marginLeft: '0px', marginRight: '0px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px'}}>
              <Grid item xs={6}>
                 <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={6}>
              <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                  labelId="type-label"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  label="Type"
              >   
                  <MenuItem value="Any">Any Type</MenuItem>
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Scholarship Administrator">Scholarship Administrator</MenuItem>
                  <MenuItem value="Applicant Reviewer">Applicant Reviewer</MenuItem>
                  <MenuItem value="Scholarship Provider">Scholarship Provider</MenuItem>
                  <MenuItem value="Scholarship Fund Steward">Scholarship Fund Steward</MenuItem>
                  <MenuItem value="Engineering Staff">Engineering Staff</MenuItem>
                  <MenuItem value="IT Staff">IT Staff</MenuItem>
              </Select>
              </FormControl>
              </Grid>
              <Grid item xs={6}>
                 <TextField
                    label="Phone Number"
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    type="number"
                    inputProps={{ step: "1" }}
                    sx={{ width: '100%', marginBottom: '5px' }}
                  />
              </Grid>
              <Grid item xs={6}>
                 <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
            </Grid>
          )}
          <Container style={{ display: "flex", minWidth: "100%", alignItems: "center" }}>
            <MuiTable endpoint="http://localhost:8000/getusers/" filter={constructFilter()} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
 );
}
