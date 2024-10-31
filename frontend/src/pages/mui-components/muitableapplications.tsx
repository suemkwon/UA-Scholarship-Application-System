import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select'; // Import Select
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem
import Grid from '@mui/material/Grid';
import { useLocation } from 'react-router-dom';

interface Application {
  [key: string]: string | number;
  applicationID: number;
  netID: string;
  scholarshipID: number;
  scholarshipName: string;
  firstName: string;
  lastName: string;
  timestamp: string;
  essay: string;
  transcript: string;
  recommendationLetter: string;
  status: string;
}

interface Scholarship {
  applicationID: number;
  scholarshipName: string;
 }

// Define the MuiTable component
export default function MuiTable({ endpoint, filter }: { endpoint: string; filter: string; }) {
  const [tableData, setTableData] = useState<Application[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setselectedApplication] = useState<Application | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [applicationID, setApplicationID] = useState('');
  const [netID, setNetID] = useState('');
  const [scholarshipID, setScholarshipID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [essay, setEssay] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recommendationLetter, setRecommendationLetter] = useState('');
  const [status, setStatus] = useState('');
  const [scholarshipArray, setScholarships] = useState<Record<number, string>>({});
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isStudent, setIsStudent] = useState(false);

  const location = useLocation();

  const fetchData = async () => {
    try {
       console.log('Fetching data from:', endpoint); // Debug: Log the endpoint URL
       const response = await axios.get(endpoint);
       console.log('First API response:', response.data); // Debug: Log the response data
       const { applications } = response.data;
       let applications_two: Application[];
       if (!applications || applications.length === 0) {
         console.error('No applications data received.');
         return; // Exit the function if no data
       }
       if (isStudent || sessionStorage.type === 'Student') {
        const filteredApplications = applications.filter((application: Application) => application.netID === sessionStorage.net_id);
        setTableData(filteredApplications);
        setIsStudent(true);
        applications_two = filteredApplications;
       } 
       else {  
        setTableData(applications); // Store the fetched data in tableData
        setIsStudent(false);
        applications_two = applications;
       }

       // Extract applicationIDs from the fetched data
       const applicationIds = applications_two.map((application: Application) => application.applicationID);
   
       // Make the second request using the extracted applicationIDs
       const scholarshipsResponse = await axios.get(`http://localhost:8000/getscholarshipsfromapplications/${applicationIds.join(',')}/`);
       const scholarships = scholarshipsResponse.data.scholarships;
   
      // Assuming scholarships is the array of scholarships you've fetched
      const scholarshipArray = scholarships.reduce((acc: Record<number, string>, scholarship: Scholarship) => {
        acc[scholarship.applicationID] = scholarship.scholarshipName;
        return acc;
       }, {} as Record<number, string>);
   
       const applicationsWithScholarshipNames = applications_two.map((application: Application) => {
          return {
            ...application,
            scholarshipName: scholarshipArray[application.applicationID],
          };
       });

       console.log('Applications with scholarship names:', applicationsWithScholarshipNames);
   
       // Update tableData with the enriched applications
       setTableData(applicationsWithScholarshipNames);

    } catch (error) {
       console.error('Error fetching data or scholarships:', error);
       // Consider setting some state or showing a message to the user here
    }
   };

  useEffect(() => {
    fetchData();
   }, [endpoint]); // Re-fetch data if the endpoint changes

  useEffect(() => {
    if (selectedApplication) {
      setApplicationID(selectedApplication.applicationID.toString());
      setNetID(selectedApplication.netID);
      setScholarshipID(selectedApplication.scholarshipID.toString());
      setFirstName(selectedApplication.firstName);
      setLastName(selectedApplication.lastName);
      setTimestamp(selectedApplication.timestamp);
      setEssay(selectedApplication.essay);
      setTranscript(selectedApplication.transcript);
      setRecommendationLetter(selectedApplication.recommendationLetter);
      setStatus(selectedApplication.status.toString());
      setMatchScore(typeof selectedApplication.matchScore === 'number' ? selectedApplication.matchScore : null);
    }
  }, [selectedApplication]);

  const modifyApplicationData = {
    "applicationID": applicationID,
    "netID": netID,
    "scholarshipID": scholarshipID,
    "firstName": firstName,
    "lastName": lastName,
    "timestamp": timestamp,
    "matchScore": matchScore,
    "essay": essay,
    "transcript": transcript,
    "recommendationLetter": recommendationLetter,
    "status": status,
   };

  // Parse the filter string into an object
  const filters = filter.split('&').reduce((acc, item) => {
    const [key, value] = item.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Filter function to filter the data based on the filters object
  const filteredData = tableData.filter(row => {
  return Object.entries(filters).every(([key, value]) => {
    switch (key) {
      case 'scholarship':
          return row.scholarshipName.toString().toLowerCase().includes(value.toLowerCase());
      case 'netID':
          return row.netID.toLowerCase().includes(value.toLowerCase());
      case 'name':
          return row.firstName.toLowerCase().includes(value.toLowerCase()) || row.lastName.toLowerCase().includes(value.toLowerCase());
      case 'status':
        //In Progress, Submitted, Under Review, Rejected, Awarded
          if (value === 'In Progress') {
            return row.status === 'In Progress';
          }
          if (value === 'Submitted') {
            return row.status === 'Submitted';
          }
          if (value === 'Under Review') {
            return row.status === 'Under Review';
          }
          if (value === 'Rejected') {
            return row.status === 'Rejected';
          }
          if (value === 'Awarded') {
            return row.status === 'Awarded';
          }
          if (value === 'All') {
            return true;
          }
          return true;
      default:
        return true;
    }
  });
  });

  // Sort function
  const sortData = (data: Application[], field: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      if (a[field] < b[field]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Sort the filtered data
  const sortedData = sortData(filteredData, sortField, sortDirection);

  // Function to handle header click
  const handleHeaderClick = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Function to handle row click
  const handleRowClick = (applicationID: number) => {
    // Find the user with the specified ID
    const application = tableData.find(application => application.applicationID === applicationID);
    console.log(application);
  
    // If the user is found, set it to the selectedApplication state
    if (application) {
      setselectedApplication(application);
      setIsModalOpen(true); // Open the modal
    } else {
      console.error(`application with ID ${applicationID} not found.`);
    }
  };

  return (
    <>
    <TableContainer component={Paper} style={{ backgroundColor: "#FAFAFA", width: '100%'}}>
      <Table aria-label="simple table">
      <TableHead>
        <TableRow style={{ cursor: 'pointer' }}>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('scholarship')}>
              Scholarship {sortField === 'scholarship' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('firstName')}>
              First {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('lastName')}>
              Last {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            {location.pathname === '/applications' && (
              <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('timestamp')}>
                  Date Submitted {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
            )}
            {location.pathname === '/applicantmatch' && (
              <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('matchScore')}>
                  Match Score {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
            )}
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('status')}>
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
        </TableRow>
      </TableHead>
      <TableBody style={{height: 'fit-content'}}>
      {sortedData.map((row) => (
        <TableRow
          key={row.applicationID}
          onMouseEnter={() => setHoveredRow(row.applicationID)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => handleRowClick(row.applicationID)}
          style={{ backgroundColor: hoveredRow === row.userID ? 'lightblue' : 'inherit', cursor: hoveredRow === row.userID ? 'pointer' : 'default' }}
        >
          <TableCell align="center">
            {row.scholarshipName}
          </TableCell> 
          <TableCell align="center">{row.firstName}</TableCell>
          <TableCell align="center">{row.lastName}</TableCell>
          {location.pathname === '/applications' && (
          <TableCell align="center">{new Date(row.timestamp).toLocaleDateString()}</TableCell>
          )}
          {location.pathname === '/applicantmatch' && (
          <TableCell align="center">{row.matchScore}</TableCell>
          )}
          <TableCell align="center">{row.status}</TableCell>
        </TableRow>
      ))}
        </TableBody>
      </Table>
    </TableContainer>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
      <Typography id="modal-title" variant="h6" component="h2">
        Application Details
      </Typography>
      <Typography component="div" id="modal-description" sx={{ mt: 2 }}>
        {selectedApplication && (
          <div>
            {isEditMode ? (
              <>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <div><strong>Scholarship: {selectedApplication.scholarshipName} </strong></div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div><strong>Applicant: {selectedApplication.firstName} {selectedApplication.lastName}</strong></div>
                    </Grid>
                    {location.pathname === '/applicantmatch' && (
                      <Grid item xs={12} sm={6}>
                      <TextField
                        label="Match Score"
                        type="number"
                        value={matchScore}
                        onChange={(e) => setMatchScore(e.target.value === '' ? null : Number(e.target.value))}
                        InputProps={{
                          inputProps: {
                            min: 0, // Assuming match score cannot be negative
                            step: 1, // Increment/decrement by 1
                          },
                        }}
                        variant="outlined"
                        fullWidth
                        />
                      </Grid>
                    )}
                    <Grid item xs={6} sm={12}>
                      <div><strong>Net ID: </strong>{selectedApplication.netID}</div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <div><strong>Date Submitted: </strong>{selectedApplication.timestamp}</div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    <InputLabel id="label-status">Status</InputLabel>
                    <Select
                        labelId="label-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        label="Status"
                    >   
                            {/* In Progress, Submitted, Under Review, Rejected, Awarded */}
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Submitted">Submitted</MenuItem>
                        <MenuItem value="Under Review">Under Review</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Awarded">Awarded</MenuItem>
                    </Select>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                    <TextField
                      label="Essay"
                      defaultValue={selectedApplication.essay}
                      value={essay}
                      onChange={(e) => setEssay(e.target.value)}
                      multiline
                      rows={4} // Adjust based on your needs
                      InputProps={{
                        style: {
                          maxHeight: '100px', // Adjust this value based on your needs
                          overflow: 'auto', // Enable scrolling if content exceeds maxHeight
                        },
                      }}
                      variant="outlined"
                      fullWidth
                      />    
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <TextField 
                        label="Transcript"
                        defaultValue={selectedApplication.transcript}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        multiline
                        rows={4} // Adjust based on your needs
                        InputProps={{
                          style: {
                            maxHeight: '100px', // Adjust this value based on your needs
                            overflow: 'auto', // Enable scrolling if content exceeds maxHeight
                          },
                        }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <TextField label="recommendationLetter" 
                      defaultValue={selectedApplication.recommendationLetter}
                      value={recommendationLetter}
                      onChange={(e) => setRecommendationLetter(e.target.value)}
                      multiline
                      rows={4} // Adjust based on your needs
                      InputProps={{
                        style: {
                          maxHeight: '100px', // Adjust this value based on your needs
                          overflow: 'auto', // Enable scrolling if content exceeds maxHeight
                        },
                      }}
                      variant="outlined"
                      fullWidth
                      />
                    </Grid>
                </Grid>
              </>
            ) : (
              <>
                <div><strong>Scholarship: {selectedApplication.scholarshipName} </strong></div>
                <div><strong>Applicant: {selectedApplication.firstName} {selectedApplication.lastName}</strong></div>
                {location.pathname === '/applicantmatch' && (
                  <div><strong>Match Score: </strong>{selectedApplication.matchScore}</div>
                )}
                <div><strong>Net ID: </strong>{selectedApplication.netID}</div>
                <div><strong>Date Submitted: </strong>{new Date(selectedApplication.timestamp).toLocaleDateString()}</div>
                <div><strong>Status: </strong>{selectedApplication.status}</div>
              </>
            )}
          </div>
        )}
      </Typography>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        mt: 2, // Add some margin at the top if needed
      }}>
        <Button
          variant="contained"
          onClick={() => setIsModalOpen(false)}
          sx={{
            backgroundColor: '#ab0520',
            ':hover': {
              backgroundColor: 'lightblue', // Change this to your desired hover color
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
              if (isEditMode) {
                // Assuming you have the necessary data ready to send in the POST request
                try {
                  // Replace 'yourEndpoint' with the actual endpoint you're sending the POST request to
                    // and replace 'yourData' with the actual data you're sending
                    const response = await axios.put(`http://localhost:8000/updateApplication/${selectedApplication?.applicationID}`, modifyApplicationData);if (response.status === 200) {
                    // If the POST request is successful, show a confirmation popup
                    alert('Successfully modified application data.\nRefresh the page to see changes.');
                    setIsEditMode(false); // Exit edit mode
                  } else {
                    alert('Failed to save changes. Please try again.');
                  }
                } catch (error) {
                  console.error('Error sending POST request:', error);
                  alert('Failed to save changes. Please try again.');
                }
              } else {
                setIsEditMode(true); // Enter edit mode
              }
          }}
          sx={{
              backgroundColor: isEditMode ? '#ab0520' : '#000',
              ':hover': {
                backgroundColor: 'lightblue', // Change this to your desired hover color
              },
          }}
          >
          {isEditMode ? 'Save' : 'Modify'}
        </Button>
      </Box>
  </Box>
  </Modal>
    </>
 );
}

