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
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
// Define the Scholarship interface
interface Scholarship {
 [key: string]: any;
 scholarshipID: number;
 applications: number[];
 awardedApplications: number[];
 awardAmount: number;
 sponsorID: string;
 numberAvailable: number;
 majors: string;
 minors: string;
 gpa: number;
 deadline: string;
 otherRequirements: string;
 scholarshipName: string;
}

// Define the MuiTable component
export default function MuiTable({ endpoint, filter }: { endpoint: string; filter: string; }) {
 const [tableData, setTableData] = useState<Scholarship[]>([]);
 const [sortField, setSortField] = useState<string>('');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
 const [hoveredRow, setHoveredRow] = useState<number | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
 const [userType, setUserType] = useState<string>('');
 const navigate = useNavigate();
  // Fetch data from the API
  useEffect(() => {
    setUserType(sessionStorage.getItem('type') || '');
    axios.get(endpoint)
      .then(response => {
        const { scholarships } = response.data;
        setTableData(scholarships);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [endpoint]);

  // Parse the filter string into an object
  const filters = filter.split('&').reduce((acc, item) => {
    const [key, value] = item.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Filter function to filter the data based on the filters object
  const filteredData = tableData.filter(row => {
  return Object.entries(filters).every(([key, value]) => {
    let rowValue;
    switch (key) {
      case 'name':
          return row.scholarshipName.toLowerCase().includes(value.toLowerCase());
      case 'majors':
          return row.majors.toLowerCase().includes(value.toLowerCase());
      case 'minors':
          return row.minors.toLowerCase().includes(value.toLowerCase());
      case 'minAwardAmount':
          return row.awardAmount >= parseFloat(value);
      case 'maxAwardAmount':
          return row.awardAmount <= parseFloat(value);
      case 'minNumberAvailable':
          return row.numberAvailable >= parseInt(value);
      case 'maxNumberAvailable':
          return row.numberAvailable <= parseInt(value);
      case 'minGpa':
          return row.gpa >= parseFloat(value);
      case 'maxGpa':
          return row.gpa <= parseFloat(value);
      case 'deadline':
          if (value === 'Today') {
            return new Date(row.deadline.substring(0, 10)).getTime() === new Date().getTime();
          } 
          else if (value === 'This Week') {
            const today = new Date();
            const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
            return new Date(row.deadline.substring(0, 10)).getTime() <= nextWeek.getTime();
          }
          else if (value === 'This Month') {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
            return new Date(row.deadline.substring(0, 10)).getTime() <= nextMonth.getTime();
          }
          else if (value === 'This Year') {
            const today = new Date();
            const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            return new Date(row.deadline.substring(0, 10)).getTime() <= nextYear.getTime();
          }
          else if (value === 'Past Due') {
            return new Date(row.deadline.substring(0, 10)).getTime() < new Date().getTime();
          }
          else if (value === 'Open') {
            return new Date(row.deadline.substring(0, 10)).getTime() > new Date().getTime();
          }
          else {
            return true;
          }
      case 'sponsorID':
        return row.sponsorID.toLowerCase().includes(value.toLowerCase());
      default:
        return true;
    }
  });
  });

  // Sort function
  const sortData = (data: Scholarship[], field: string, direction: 'asc' | 'desc') => {
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
  const handleRowClick = (scholarshipID: number) => {
    // Find the scholarship with the specified ID
    const scholarship = tableData.find(scholarship => scholarship.scholarshipID === scholarshipID);

    console.log(scholarship);
    // If the scholarship is found, set it to the selectedScholarship state
    if (scholarship) {
      setSelectedScholarship(scholarship);
      setIsModalOpen(true); // Open the modal
      sessionStorage.setItem('selectedScholarship', JSON.stringify(scholarship)); // Save the scholarship in sessionStorage
      sessionStorage.setItem('selectedScholarshipId', scholarshipID.toString()); // Save the scholarship ID in sessionStorage
      sessionStorage.setItem('selectedScholarshipName', scholarship.scholarshipName); // Save the scholarship name in sessionStorage
    } else {
      console.error(`Scholarship with ID ${scholarshipID} not found.`);
    }
  };

  const handleReportClick = () => {
    if (selectedScholarship) {
      axios({
        url: 'http://localhost:8000/applicantreport/',
        method: 'POST',
        responseType: 'blob', // Important
        data: selectedScholarship,
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Scholarship_Applicant_Report.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error('Error querying applicants:', error);
      });
    }
  };

  const handleModifyClick = () => {
    if (selectedScholarship) {
      console.log(selectedScholarship)
      navigate(`/editscholarship/`, { state: { scholarship: selectedScholarship } });
    }
  };

  const handleDeleteClick = () => {
    if (selectedScholarship) {
      axios.delete(`http://localhost:8000/scholarships/${selectedScholarship.scholarshipID}/delete/`)
      .then(response => {
        console.log('Scholarship deleted:', response.data);
        navigate('/scholarships');
      })
      .catch(error => {
        console.error('Error deleting scholarship:', error);
        // Handle error here, e.g. show error message to user
      });
    }
  };
 return (
  <>
    <TableContainer component={Paper} style={{ backgroundColor: "#FAFAFA", width: '100%'}}>
      <Table aria-label="simple table">
      <TableHead>
        <TableRow style={{ cursor: 'pointer' }}>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('scholarshipName')}>
              Name {sortField === 'scholarshipName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('majors')}>
              Majors {sortField === 'majors' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('minors')}>
              Minors {sortField === 'minors' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('awardAmount')}>
              Award Amount {sortField === 'awardAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "5%" }} onClick={() => handleHeaderClick('numberAvailable')}>
              # Available {sortField === 'numberAvailable' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "5%" }} onClick={() => handleHeaderClick('gpa')}>
              GPA {sortField === 'gpa' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "5%" }} onClick={() => handleHeaderClick('deadline')}>
              Deadline {sortField === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
            <TableCell align="center" style={{ verticalAlign: "top", width: "10%" }} onClick={() => handleHeaderClick('sponsorID')}>
              Donor {sortField === 'sponsorID' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableCell>
        </TableRow>
      </TableHead>
        <TableBody style={{height: 'fit-content'}}>
          {sortedData.map((row) => (
            <TableRow
              key={row.scholarshipID}
              onMouseEnter={() => setHoveredRow(row.scholarshipID)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => handleRowClick(row.scholarshipID)}
              style={{ backgroundColor: hoveredRow === row.scholarshipID ? 'lightblue' : 'inherit', cursor: hoveredRow === row.scholarshipID ? 'pointer' : 'default' }}
              >
              <TableCell align="center">{row.scholarshipName}</TableCell>
              <TableCell align="center">{row.majors}</TableCell>
              <TableCell align="center">{row.minors}</TableCell>
              <TableCell align="center">${row.awardAmount}</TableCell>
              <TableCell align="center">{row.numberAvailable}</TableCell>
              <TableCell align="center">{row.gpa.toFixed(2)}</TableCell>
              <TableCell align="center">{new Date(row.deadline.substring(0, 10)).toLocaleDateString()}</TableCell>
              <TableCell align="center">{row.sponsorID}</TableCell>
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
            <h2 id="modal-title">Scholarship Details</h2>
            <div id="modal-description" style={{ marginTop: 2 }}>
              {selectedScholarship && (
                <div>
                  <div><strong>Name:</strong> {selectedScholarship.scholarshipName}</div>
                  <div><strong>Award Amount:</strong> ${selectedScholarship.awardAmount}</div>
                  <div><strong>Number Available:</strong> {selectedScholarship.numberAvailable}</div>
                  <div><strong>Majors:</strong> {selectedScholarship.majors}</div>
                  <div><strong>Minors:</strong> {selectedScholarship.minors}</div>
                  <div><strong>GPA Requirement:</strong> {selectedScholarship.gpa}</div>
                  <div><strong>Deadline:</strong> {new Date(selectedScholarship.deadline.substring(0, 10)).toLocaleDateString()}</div>
                  <div><strong>Other Requirements:</strong> {selectedScholarship.otherRequirements}</div>
                  <div><strong>Donor:</strong> {selectedScholarship.sponsorID}</div>
                </div>
              )}
            </div>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            mt: 2, // Adjust the margin as needed
          }}>
            <Button
              variant="contained"
              onClick={() => setIsModalOpen(false)}
              sx={{
                backgroundColor: '#ab0520',
                ':hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color as needed
                },
              }}
            >
              Close
            </Button>
            { (userType === "Scholarship Administrator" || userType === "Scholarship Reviewer" || userType === "Scholarship Provider" ) && (
            <Button
              variant="contained"
              onClick={() => handleReportClick()}
              sx={{
                ':hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color as needed
                },
              }}
            >
              Generate Applicant Report
            </Button>
          )}
          {userType === "Student" && (
          <Button
              variant="contained"
              onClick={() => {
                // Implement the apply functionality here
                window.location.href = 'http://localhost:3000/application';
                console.log('Applying for scholarship:', selectedScholarship);
              }}
              sx={{
                ':hover': {
                  backgroundColor: 'lightblue', // Adjust the hover color as needed
                },
              }}
          >
              Apply
          </Button>
        )}
          </Box>
          { (userType === "Scholarship Administrator" || userType === "Engineering Staff") && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            mt: 2, // Adjust the margin as needed
          }}>
            <Button
          variant="contained"
          onClick={() => handleModifyClick()}
          sx={{
            ':hover': {
              backgroundColor: 'lightblue', // Adjust the hover color as needed
            },
          }}
        >
          Modify
        </Button>
        <Button
          variant="contained"
          onClick={() => handleDeleteClick()}
          sx={{
            backgroundColor: '#ab0520',
            ':hover': {
              backgroundColor: 'lightblue', // Adjust the hover color as needed
            },
          }}
        >
          Delete
        </Button>
        
        </Box>)}
        </Box>
      </Modal>
    </>
 );
}