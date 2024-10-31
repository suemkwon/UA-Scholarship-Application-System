import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MuiTable from './mui-components/muitablescholarships';    
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import { Modal } from '@mui/material';
import Typography from '@mui/material/Typography';

const defaultTheme = createTheme();

export default function Scholarships() {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [name, setName] = React.useState('');
  const [majors, setMajors] = React.useState('');
  const [minors, setMinors] = React.useState('');
  const [minAwardAmount, setMinAwardAmount] = React.useState('');
  const [maxAwardAmount, setMaxAwardAmount] = React.useState('');
  const [minGpa, setMinGpa] = React.useState('');
  const [maxGpa, setMaxGpa] = React.useState('');
  const [minNumberAvailable, setMinNumberAvailable] = React.useState('');
  const [maxNumberAvailable, setMaxNumberAvailable] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [sponsorID, setsponsorID] = React.useState('');
  const [scholarshipName, setScholarshipName] = React.useState('');
  const [scholarshipDonor, setScholarshipDonor] = React.useState('');
  const [awardAmount, setAwardAmount] = React.useState('');
  const [numberAvailable, setNumberAvailable] = React.useState('');
  const [gpa, setGpa] = React.useState('');
  const [otherRequirements, setOtherRequirements] = React.useState('');
  const [filterMajors, setFilterMajors] = React.useState('');

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const handleScholarshipFieldChange = (field: string, value: string | number) => {
    switch (field) {
         case 'scholarshipName':
           setScholarshipName(value.toString());
           break;
         case 'scholarshipDonor':
           setScholarshipDonor(value.toString());
           break;
         case 'awardAmount':
           // Prepend a $ to the awardAmount value
           setAwardAmount(`${value.toString()}`);
           break;
         case 'numberAvailable':
           setNumberAvailable(value.toString());
           break;
         case 'majors':
           setMajors(value.toString());
           break;
         case 'minors':
           setMinors(value.toString());
           break;
         case 'gpa':
            // Parse the value as a float
            let parsedGpa = parseFloat(value.toString());
            // Clamp the value between 0.00 and 4.00
            if (parsedGpa < 0.00) {
               parsedGpa = 0.00;
            } else if (parsedGpa > 4.00) {
               parsedGpa = 4.00;
            }
            // Format it to two decimal places
            const formattedGpa = parsedGpa.toFixed(2);
            setGpa(formattedGpa);
            break;
         case 'deadline':
           setDeadline(value.toString());
           break;
         case 'otherRequirements':
           setOtherRequirements(value.toString());
           break;
         default:
           break;
    }
   }

   const handleCreateScholarship = async () => {
    // Gather data from form fields
    const scholarshipData = {
       scholarshipName,
       scholarshipDonor,
       sponsorID: sessionStorage.getItem('net_id') || '', // Retrieve user_id from session storage
       majors,
       minors,
       awardAmount,
       numberAvailable,
       gpa,
       deadline,
       otherRequirements,
    };
   
    try {
       const response = await fetch('http://localhost:8000/createscholarship/', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(scholarshipData),
       });
   
       if (!response.ok) {
         throw new Error('Network response was not ok');
       }
   
       const data = await response.json();
       console.log('Success:', data);
       alert('Scholarship created successfully');
       // Optionally, close the modal or show a success message
       setCreateOpen(false);
    } catch (error) {
       console.error('Error:', error);
       // Optionally, show an error message
    }
   };

    const openCreateScholarship = () => {
      setCreateOpen(true);
    }

 const constructFilter = () => {
    let filter = '';
    if (name) filter += `name=${name}&`;
    if (filterMajors) filter += `majors=${filterMajors}&`;
    if (minors) filter += `minors=${minors}&`;
    if (minAwardAmount) filter += `minAwardAmount=${minAwardAmount}&`;
    if (maxAwardAmount) filter += `maxAwardAmount=${maxAwardAmount}&`;
    if (minNumberAvailable) filter += `minNumberAvailable=${minNumberAvailable}&`;
    if (maxNumberAvailable) filter += `maxNumberAvailable=${maxNumberAvailable}&`;
    if (minGpa) filter += `minGpa=${minGpa}&`;
    if (maxGpa) filter += `maxGpa=${maxGpa}&`;
    if (deadline) filter += `deadline=${deadline}&`;
    if (sponsorID) filter += `sponsorID=${sponsorID}&`;

    // Remove the trailing '&' if it exists
    return filter.endsWith('&') ? filter.slice(0, -1) : filter;
  };

   // Check if the session storage variable "type" is one of the allowed types
 const showCreate = sessionStorage.getItem('type') === 'Scholarship Administrator';

 return (
  <>
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Box style={{ width: '100%', height: '100vh' }}>
          <h1 style={{ textAlign: 'center' }}>Scholarships</h1>
          <TextField 
            label="Search Scholarships" 
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
          {showCreate && (
            <Button 
              onClick={openCreateScholarship}
              sx={{ 
                  backgroundColor: '#ab0520', 
                  color: 'white', 
                  marginBottom: '30px',
                  marginLeft: '10px',
                  '&:hover': {
                    backgroundColor: 'lightblue', // Adjust the hover color here
                  },
              }}>
                Create Scholarship
            </Button> 
          )}
          {filterVisible && (
            <Grid container spacing={2} style={{marginBottom: '20px', marginLeft: '0px', marginRight: '0px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px'}}>
              <Grid item xs={6}>
                 <TextField label="Majors" value={filterMajors} onChange={(e) => setFilterMajors(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={6}>
                 <TextField label="Minors" value={minors} onChange={(e) => setMinors(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                 <TextField label="Min Award Amount" value={minAwardAmount} onChange={(e) => setMinAwardAmount(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                 <TextField label="Max Award Amount" value={maxAwardAmount} onChange={(e) => setMaxAwardAmount(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                 <TextField label="Min Number Available" value={minNumberAvailable} onChange={(e) => setMinNumberAvailable(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                 <TextField label="Max Number Available" value={maxNumberAvailable} onChange={(e) => setMaxNumberAvailable(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
              <Grid item xs={3}>
                <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
                  <InputLabel htmlFor="min-gpa">Minimum GPA</InputLabel>
                  <Input
                    id="min-gpa"
                    type="number"
                    value={minGpa}
                    onChange={(e) => setMinGpa(e.target.value)}
                    onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value < 0) {
                          setMinGpa('0.00');
                        } else if (value > 4) {
                          setMinGpa('4.00');
                        }
                    }}
                    inputProps={{ step: "0.01" }}
                    sx={{ width: '100%', marginBottom: '5px' }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
                  <InputLabel htmlFor="max-gpa">Maximum GPA</InputLabel>
                  <Input
                    id="max-gpa"
                    type="number"
                    value={maxGpa}
                    onChange={(e) => setMaxGpa(e.target.value)}
                    onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value < 0) {
                          setMaxGpa('0.00');
                        } else if (value > 4) {
                          setMaxGpa('4.00');
                        }
                    }}
                    inputProps={{ step: "0.01" }}
                    sx={{ width: '100%', marginBottom: '5px' }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
              <FormControl sx={{ width: '100%', marginBottom: '5px' }}>
              <InputLabel id="deadline-label">Deadline</InputLabel>
              <Select
                  labelId="deadline-label"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  label="Deadline"
              >   
                  <MenuItem value="Any">Any Deadline</MenuItem>
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="This Week">This Week</MenuItem>
                  <MenuItem value="This Month">This Month</MenuItem>
                  <MenuItem value="This Year">This Year</MenuItem>
                  <MenuItem value="Past Due">Past</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
              </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12}>
                 <TextField label="Donor" value={sponsorID} onChange={(e) => setsponsorID(e.target.value)} sx={{ width: '100%', marginBottom: '5px' }} />
              </Grid>
            </Grid>
          )}
          <Container style={{ display: "flex", minWidth: "100%", alignItems: "center" }}>
            <MuiTable endpoint="http://localhost:8000/getallscholarships/" filter={constructFilter()} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
    <Modal
      open={createOpen}
      onClose={() => setCreateOpen(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
        }}>
          <Typography id="modal-student-title" variant="h6" component="h2">
            Create Scholarship
          </Typography>
          <Typography id="modal-description-student" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={12}>
                  <TextField label="Scholarship Name" value={scholarshipName} onChange={(e) => handleScholarshipFieldChange('scholarshipName', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6} sm={12}>
                  <TextField label="Scholarship Donor" value={scholarshipDonor} onChange={(e) => handleScholarshipFieldChange('scholarshipDonor', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6} sm={12}>
                  <TextField label="Majors" value={majors} onChange={(e) => handleScholarshipFieldChange('majors', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6} sm={12}>
                  <TextField label="Minors" value={minors} onChange={(e) => handleScholarshipFieldChange('minors', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <TextField label="Award Amount" value={awardAmount} onChange={(e) => handleScholarshipFieldChange('awardAmount', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <TextField label="Number Available" value={numberAvailable} onChange={(e) => handleScholarshipFieldChange('numberAvailable', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="GPA" value={gpa} onChange={(e) => handleScholarshipFieldChange('gpa', e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    label="Deadline"
                    value={deadline}
                    onChange={(e) => handleScholarshipFieldChange('deadline', e.target.value)}
                    type="date"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                  label="Other Requirements"
                  value={otherRequirements}
                  onChange={(e) => handleScholarshipFieldChange('otherRequirements', e.target.value)}
                  fullWidth
                  multiline
                  rows={4} // Adjust the number of rows as needed
                  variant="outlined" // Optional: for a more distinctive look
                />
                </Grid>
              </Grid>
          </Typography>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            mt: 2, // Adjust the margin as needed
          }}>
            <Button
              variant="contained"
              onClick={() => setCreateOpen(false)}
              sx={{
                backgroundColor: '#ab0520',
                ':hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color as needed
                },
              }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateScholarship}
              sx={{
                ':hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color as needed
                },
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
      </>
 );
}
