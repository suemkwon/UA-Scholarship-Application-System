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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select'; // Import Select
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem
import Grid from '@mui/material/Grid';


interface User {
  [key: string]: any;
  userID: number;
  netID: string;
  username: string;
  email: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: number;
}

// Define the MuiTable component
export default function MuiTable({ endpoint, filter }: { endpoint: string; filter: string; }) {
  const [tableData, setTableData] = useState<User[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [type, setType] = useState(''); // Define type state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userID, setUserID] = useState('');
  const [netID, setNetID] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // State for student modal
const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

// State for student modal fields
const [pronouns, setPronouns] = useState('');
const [ethnicity, setEthnicity] = useState('');
const [currentYear, setCurrentYear] = useState('');
const [gpa, setGpa] = useState('');
const [majors, setMajors] = useState('');
const [minors, setMinors] = useState('');
const [personalStatement, setPersonalStatement] = useState('');
const [workExperience, setWorkExperience] = useState('');

// Handle changing fields in student modal
const handleStudentFieldChange = (field: string, value: string) => {
  switch (field) {
    case 'pronouns':
      setPronouns(value);
      break;
    case 'ethnicity':
      setEthnicity(value);
      break;
    case 'currentYear':
      setCurrentYear(value);
      break;
    case 'gpa':
      setGpa(value);
      break;
    case 'majors':
      setMajors(value);
      break;
    case 'minors':
      setMinors(value);
      break;
    case 'personalStatement':
      setPersonalStatement(value);
      break;
    case 'workExperience':
      setWorkExperience(value);
      break;
    default:
      break;
  }
};

// Clear student modal fields
const clearStudentModalFields = () => {
  setPronouns('');
  setEthnicity('');
  setCurrentYear('');
  setGpa('');
  setMajors('');
  setMinors('');
  setPersonalStatement('');
  setWorkExperience('');
};

// Update user data for student
const updateUserStudentData = async () => {
  try {
    const response = await axios.put('http://localhost:8000/updateStudent/', {
      netID: selectedUser?.netID,
      pronouns,
      ethnicity,
      currentYear,
      gpa,
      type,
      majors,
      minors,
      personalStatement,
      workExperience
    });
    if (response.status === 200) {
      alert('Successfully modified user data.\nRefresh the page to see changes.');
      setIsStudentModalOpen(false); // Close student modal after successful update
      setIsEditMode(false); // Exit edit mode
    } else {
      alert('Failed to save changes. Please try again.');
    }
  } catch (error) {
    console.error('Error sending PUT request:', error);
    alert('Failed to save changes. Please try again.');
  }
};

// Clear student modal fields and close modal
const handleStudentModalClose = () => {
  clearStudentModalFields();
  setIsStudentModalOpen(false);
};


  // Fetch data from the API
  useEffect(() => {
    axios.get(endpoint)
      .then(response => {
        const { users } = response.data;
        setTableData(users);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [endpoint]);

  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstName.toString());
      setLastName(selectedUser.lastName.toString());
      setUserID(selectedUser.userID.toString());
      setNetID(selectedUser.netID.toString());
      setUsername(selectedUser.username.toString());
      setType(selectedUser.type.toString());
      setEmail(selectedUser.email.toString());
      setPhone(selectedUser.phone.toString());
    }
  }, [selectedUser]);

  const modifyUserData = {
    "firstName": firstName,
    "lastName": lastName,
    "userID": userID,
    "netID": netID,
    "username": username,
    "type": type,
    "email": email,
    "phone": phone
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
      case 'name':
          return row.firstName.toLowerCase().includes(value.toLowerCase()) || row.lastName.toLowerCase().includes(value.toLowerCase());
      case 'username':
          return row.username.toLowerCase().includes(value.toLowerCase());
      case 'phonenumber':
          // Normalize the phone number by removing non-numeric characters
          const normalizedPhone = row.phone.toString().replace(/\D/g, '');
          const normalizedFilterValue = value.replace(/\D/g, '');
          return normalizedPhone.includes(normalizedFilterValue);
      case 'email':
          return row.email.toLowerCase().includes(value.toLowerCase());
      case 'type':
        // Dropdown: Student, Scholarship Administrator, Applicant Reviewer, Scholarship Provider, Scholarship Fund Steward, Engineering Staff, IT Staff
          if (value === 'Student') {
            return row.type === 'Student';
          }
          if (value === 'Scholarship Administrator') {
            return row.type === 'Scholarship Administrator';
          }
          if (value === 'Applicant Reviewer') {
            return row.type === 'Applicant Reviewer';
          }
          if (value === 'Scholarship Provider') {
            return row.type === 'Scholarship Provider';
          }
          if (value === 'Scholarship Fund Steward') {
            return row.type === 'Scholarship Fund Steward';
          }
          if (value === 'Engineering Staff') {
            return row.type === 'Engineering Staff';
          }
          if (value === 'IT Staff') {
            return row.type === 'IT Staff';
          }
          return true;
      default:
        return true;
    }
  });
  });

  // Sort function
  const sortData = (data: User[], field: string, direction: 'asc' | 'desc') => {
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
  const handleRowClick = (userID: number) => {
    // Find the user with the specified ID
    const user = tableData.find(user => user.userID === userID);
    console.log(user);
    
    // If the user is found, set it to the selecteduser state
    if (user) {
      setSelectedUser(user);
      if (user.type === 'Student') {
        setIsStudentModalOpen(true); // Open the student modal
      } else {
        setIsModalOpen(true); // Open the default modal
      }
    } else {
      console.error(`User with ID ${userID} not found.`);
    }
  };

  // Function to delete a user
  const deleteUser = (netID: string | undefined) => async () => {
    if (netID) {
      try {
        const response = await axios.delete('http://localhost:8000/delete_user/', {
          data: { netID }
        });
        if (response.status === 200) {
          alert('User deleted successfully.\nRefresh the page to see changes.');
          setIsModalOpen(false);
          setIsStudentModalOpen(false);
        } else {
          alert('Failed to delete user. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    } else {
      console.error('No netID provided.');
      alert('Failed to delete user. Please try again.');
    }
  };

 return (
  <>
    <TableContainer component={Paper} style={{ backgroundColor: "#FAFAFA", width: '100%'}}>
      <Table aria-label="simple table">
      <TableHead>
        <TableRow style={{ cursor: 'pointer' }}>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('username')}>
              Username {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('firstName')}>
              First {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('lastname')}>
              Last {sortField === 'lastname' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('type')}>
              Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('email')}>
              Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('phone')}>
              Phone {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
        </TableRow>
      </TableHead>
        <TableBody style={{height: 'fit-content'}}>
          {sortedData.map((row) => (
            <TableRow
              key={row.userID}
              onMouseEnter={() => setHoveredRow(row.userID)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => handleRowClick(row.userID)}
              style={{ backgroundColor: hoveredRow === row.userID ? 'lightblue' : 'inherit', cursor: hoveredRow === row.userID ? 'pointer' : 'default' }}
              >
              <TableCell align="center">{row.username}</TableCell>
              <TableCell align="center">{row.firstName}</TableCell>
              <TableCell align="center">{row.lastName}</TableCell>
              <TableCell align="center">{row.type}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.phone}</TableCell>
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
        User Details
      </Typography>
      <Typography id="modal-description" sx={{ mt: 2 }}>
        {selectedUser && (
          <div>
            {isEditMode ? (
              <>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="First Name" defaultValue={selectedUser.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Last Name" defaultValue={selectedUser.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="User ID" defaultValue={selectedUser.userID} disabled fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Net ID" defaultValue={selectedUser.netID} value={netID} onChange={(e) => setNetID(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Username" defaultValue={selectedUser.username} value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select
                          labelId="type-label"
                          value={type}
                          onChange={(e) => setType(e.target.value as string)}
                          label="Type"
                          fullWidth
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
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email" defaultValue={selectedUser.email} value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Phone" defaultValue={selectedUser.phone.toString()} value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
              </>
            ) : (
              <>
                <div><strong>{selectedUser.firstName} {selectedUser.lastName}</strong></div>
                <div><strong>User ID: </strong>{selectedUser.userID}</div>
                <div><strong>Net ID: </strong>{selectedUser.netID}</div>
                <div><strong>Username: </strong>{selectedUser.username}</div>
                <div><strong>Type: </strong>{selectedUser.type}</div>
                <div><strong>Email: </strong>{selectedUser.email}</div>
                <div><strong>Phone: </strong>{selectedUser.phone}</div>
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
        { sessionStorage.type === 'Scholarship Administrator' && (
        <Button
          variant="contained"
          onClick={deleteUser(selectedUser?.netID)}
          
          sx={{
            backgroundColor: '#000',
            ':hover': {
              backgroundColor: 'lightblue', // Change this to your desired hover color
            },
          }}
        >
          Delete
        </Button>
        )}
        <Button
          variant="contained"
          onClick={async () => {
              if (isEditMode) {
                // Assuming you have the necessary data ready to send in the POST request
                try {
                  // Replace 'yourEndpoint' with the actual endpoint you're sending the POST request to
                  // and replace 'yourData' with the actual data you're sending
                  const response = await axios.put('http://localhost:8000/updateuser/', modifyUserData);
                  if (response.status === 200) {
                    // If the POST request is successful, show a confirmation popup
                    alert('Successfully modified user data.\nRefresh the page to see changes.');
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
  <Modal
  open={isStudentModalOpen}
  onClose={handleStudentModalClose}
  aria-labelledby="modal-student-title"
  aria-describedby="modal-description-student"
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
      Student Details
    </Typography>
    <Typography id="modal-description-student" sx={{ mt: 2 }}>
    {selectedUser && (
      <div>
        <Grid container spacing={2}>
          
          <Grid item xs={12} sm={6}>
            <TextField label="Net ID" defaultValue={selectedUser.netID} value={netID} onChange={(e) => setNetID(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Pronouns" value={pronouns} onChange={(e) => handleStudentFieldChange('pronouns', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Ethnicity" value={ethnicity} onChange={(e) => handleStudentFieldChange('ethnicity', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Current Year" value={currentYear} onChange={(e) => handleStudentFieldChange('currentYear', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="GPA" value={gpa} onChange={(e) => handleStudentFieldChange('gpa', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              value={type}
              onChange={(e) => setType(e.target.value as string)}
              label="Type"
              fullWidth
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
          <Grid item xs={12}>
            <TextField label="Majors" value={majors} onChange={(e) => handleStudentFieldChange('majors', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Minors" value={minors} onChange={(e) => handleStudentFieldChange('minors', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Personal Statement" value={personalStatement} onChange={(e) => handleStudentFieldChange('personalStatement', e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Work Experience" value={workExperience} onChange={(e) => handleStudentFieldChange('workExperience', e.target.value)} fullWidth />
          </Grid>
        </Grid>
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
        onClick={handleStudentModalClose}
        sx={{
          backgroundColor: '#ab0520',
          ':hover': {
            backgroundColor: 'lightblue', // Change this to your desired hover color
          },
        }}
      >
        Close
      </Button>
      { sessionStorage.type === 'Scholarship Administrator' && (
      <Button
        variant="contained"
        onClick={deleteUser(selectedUser?.netID)}
        
        sx={{
          backgroundColor: '#000',
          ':hover': {
            backgroundColor: 'lightblue', // Change this to your desired hover color
          },
        }}
      >
        Delete
      </Button>
      )}
      <Button
        variant="contained"
        onClick={updateUserStudentData}
        
        sx={{
          backgroundColor: '#000',
          ':hover': {
            backgroundColor: 'lightblue', // Change this to your desired hover color
          },
        }}
      >
        Save
      </Button>
    </Box>
  </Box>
</Modal>

  </>
 );
}
