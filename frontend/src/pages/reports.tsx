import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';

const defaultTheme = createTheme();

const Reports: React.FC = () => {
 const [selection, setSelection] = useState('');

interface ApplicationInfo { 
 scholarshipName: string;
 scholarshipAmount: number;
 firstName: string;
 lastName: string;
 phoneNumber: string;
 netID: string;
 major: string;
 emailAddress: string;
 gpa: number;
 ethnicity: string;
}

 const handleDownload = async (endpointurl: string, filename: string) => {
  try {
     const response = await axios({
       url: endpointurl,
       method: 'GET',
       responseType: 'blob', // Important
     });
 
     const url = window.URL.createObjectURL(new Blob([response.data]));
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', `${filename}.csv`);
     document.body.appendChild(link);
     link.click();
  } catch (error) {
     console.error('Error downloading report:', error);
  }
 };

 return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
            <Box style={{ width: '100%', height: '100vh' }}>
              <h1 style={{ textAlign: 'center' }}>Reports</h1>
              <h3 style={{ textAlign: 'center' }}>Select a Report to Download</h3>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
            <Grid container spacing={2} sx={{ justifyContent: 'space-around', mb: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: selection === 'Available Scholarships' ? "#0C234B" : "#AB0520",
                      color: "white",
                      '&:hover': {
                        backgroundColor: selection === 'Available Scholarships' ? "lightgray" : "grey",
                      },
                    }}
                    onClick={() => handleDownload('http://localhost:8000/available_scholarship_report/', 'Available_Scholarships_Report')}
                  >
                    Available Scholarships
                  </Button>
              </Grid>
              { sessionStorage.type === 'Scholarship Administrator' && (
              <Grid item xs={12} sm={6} md={4}>
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: selection === 'Awarded Scholarships' ? "#0C234B" : "#AB0520",
                      color: "white",
                      '&:hover': {
                        backgroundColor: selection === 'Awarded Scholarships' ? "lightgray" : "grey",
                      },
                    }}
                    onClick={() => handleDownload('http://localhost:8000/awarded_scholarships/', 'Awarded_Scholarships_Report')}
                  >
                    Awarded Scholarships
                  </Button>
              </Grid>
              )}
              { sessionStorage.type === 'Scholarship Administrator' && (
              <Grid item xs={12} sm={6} md={4}>
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: selection === 'Student Demographics' ? "#0C234B" : "#AB0520",
                      color: "white",
                      '&:hover': {
                        backgroundColor: selection === 'Student Demographics' ? "lightgray" : "grey",
                      },
                    }}
                    onClick={() => handleDownload('http://localhost:8000/student_demographics_report/', 'Student_Demographics_Report')}
                  >
                    Student Demographics
                  </Button>
              </Grid>
              )}
              { sessionStorage.type === 'Scholarship Administrator' && (
              <Grid item xs={12} sm={6} md={4}>
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: selection === 'Active Donors' ? "#0C234B" : "#AB0520",
                      color: "white",
                      '&:hover': {
                        backgroundColor: selection === 'Active Donors' ? "lightgray" : "grey",
                      },
                    }}
                    onClick={() => handleDownload('http://localhost:8000/active_donor_report/', 'Active_Donors_Report')}
                  >
                    Active Donors
                  </Button>
              </Grid>
              )}
              <Grid item xs={12} sm={6} md={4}>
                  <Button
                    sx={{
                      width: '100%',
                      backgroundColor: selection === 'Archived Scholarships' ? "#0C234B" : "#AB0520",
                      color: "white",
                      '&:hover': {
                        backgroundColor: selection === 'Archived Scholarships' ? "lightgray" : "grey",
                      },
                    }}
                    onClick={() => handleDownload('http://localhost:8000/archived_scholarship_report/', 'Archived_Scholarships_Report')}
                  >
                    Archived Scholarships
                  </Button>
              </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </>
 );
};

export default Reports;
