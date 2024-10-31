import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiTable from './mui-components/muitableapplications';    
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const defaultTheme = createTheme();

export default function Applications() {
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [scholarship, setScholarship] = React.useState('');
  const [netID, setNetID] = React.useState('');
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState('');

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

 const constructFilter = () => {
    let filter = '';
    if (scholarship) filter += `scholarship=${scholarship}&`;
    if (netID) filter += `netID=${netID}&`;
    if (name) filter += `name=${name}&`;
    if (status) filter += `status=${status}&`;
    
    // Remove the trailing '&' if it exists
    return filter.endsWith('&') ? filter.slice(0, -1) : filter;
  };

 return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box style={{ width: '100%', height: '100vh' }}>
          <h1 style={{ textAlign: 'center' }}>Applications</h1>
          <TextField 
            label="Search Applications by Scholarship Name" 
            value={scholarship} 
            onChange={(e) => setScholarship(e.target.value)} 
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
                 <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                 <TextField label="Net ID" value={netID} onChange={(e) => setNetID(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
              <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                  labelId="status-label"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
              >   
                      {/* In Progress, Submitted, Under Review, Rejected, Awarded */}
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Awarded">Awarded</MenuItem>
              </Select>
              </FormControl>
              </Grid>
            </Grid>
          )}
          <Container style={{ display: "flex", minWidth: "100%", alignItems: "center" }}>
            <MuiTable endpoint="http://localhost:8000/getapplications/" filter={constructFilter()} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
 );
}
