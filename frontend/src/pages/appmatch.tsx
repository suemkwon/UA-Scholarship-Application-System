import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiTable from './mui-components/muitableapplications';    
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const defaultTheme = createTheme();


export default function Applications() {
  const [scholarship, setScholarship] = React.useState('');
  const [netID, setNetID] = React.useState('');
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [scholarshipNames, setScholarshipNames] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/getallscholarships/')
       .then((response) => response.json())
       .then((data) => {
         // Check if the data object has a 'scholarships' property and it is an array
         if (data.scholarships && Array.isArray(data.scholarships)) {
           // Map over the 'scholarships' array to extract the 'scholarshipName' from each scholarship object
           const scholarshipNamesArray = data.scholarships.map((scholarship: any) => scholarship.scholarshipName);
           // Update the state with the extracted scholarship names
           setScholarshipNames(scholarshipNamesArray);
         } else {
           console.error('Expected an array at data.scholarships, but received:', data.scholarships);
         }
       });
   }, []);


 const constructFilter = () => {
    let filter = '';
    if (scholarship) filter += `scholarship=${scholarship}&`;
    if (status) filter += `status=${status}&`;
    
    // Remove the trailing '&' if it exists
    return filter.endsWith('&') ? filter.slice(0, -1) : filter;
  };

 return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box style={{ width: '100%', height: '100vh' }}>
          <h1 style={{ textAlign: 'center' }}>Applicant Match</h1>
            <Grid container spacing={2} style={{marginBottom: '20px', marginLeft: '0px', padding: '10px'}}>
              <Grid item xs={6}>
              <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
              <InputLabel id="scholarship-label">Scholarship Name</InputLabel>
              <Select
                  labelId="scholarship-label"
                  value={scholarship}
                  onChange={(e) => setScholarship(e.target.value)}
                  label="Scholarship"
              >
                  {scholarshipNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
              </Select>
              </FormControl>
              </Grid>
              <Grid item xs={6}>
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
          <Container style={{ display: "flex", minWidth: "100%", alignItems: "center" }}>
            <MuiTable endpoint="http://localhost:8000/getapplications/" filter={constructFilter()} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
 );
}
