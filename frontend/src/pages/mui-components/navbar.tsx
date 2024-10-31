import * as React from 'react';
import { useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom'; // Import Link

function Navbar() {
    const location = useLocation();
    const excludedRoutes = ['/signin', '/signup'];
    const [userType, setUserType] = React.useState<string | null>(null);

    const userTypePagePermissions: { [key: string]: string[] } = {
        'None': [],
        'Student': ['Home', 'Applications', 'Scholarships', 'Reports'],
        'Scholarship Administrator': ['Home', 'Applications', 'Applicant Match', 'Scholarships', 'Users', 'Reports'],
        'Applicant Reviewer': ['Home', 'Applications', 'Applicant Match', 'Reports'],
        'Scholarship Provider': ['Home', 'Applications', 'Applicant Match', 'Scholarships', 'Reports'],
        'Scholarship Fund Steward': ['Home', 'Scholarships', 'Reports'],
        'Engineering Staff': ['Home', 'Scholarships', 'Reports'],
        'IT Staff': ['Home', 'Scholarships', 'Reports'],
    };

    React.useEffect(() => {
        const storedUserType = sessionStorage.getItem('type');
        setUserType(storedUserType);
    }, []);

    if (excludedRoutes.includes(location.pathname)) {
        return null;
    }

    // Function to get the pages based on the user type
    function getFilteredPages(userType: string | null): string[] {
        // If userType is null or not defined in the mapping, return all pages
        if (!userType || !userTypePagePermissions[userType]) {
        return userTypePagePermissions['None'];
        }
        // Return the pages for the specific user type
        return userTypePagePermissions[userType];
    }

    const filteredPages = getFilteredPages(userType);

    return (
        <AppBar position="fixed" sx={{backgroundColor: '#ab0520'}}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                <Typography
                    variant="h6"
                    noWrap
                    component="a"
                    sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { cursor: 'default'},
                    }}
                >
                    UASAMS
                </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {filteredPages.map((page) => (
                            <Button 
                                key={page}
                                sx={{ my: 2, color: 'white', display: 'block', '&:hover': {backgroundColor: '#0c234b' }}}
                            >
                                <Link
                                    key={page}
                                    to={`/${page.toLowerCase().replace(/\s/g, "")}`}
                                    style={{height: '100%', textDecoration: 'none', color: 'white'}}
                                >
                                    {page}
                                </Link>
                            </Button>
                        ))}
                        <Button 
                            sx={{ my: 2, color: 'white', display: 'block', '&:hover': {backgroundColor: '#0c234b' }}}
                        >
                            <div
                                onClick={() => {
                                    // Clear session storage
                                    sessionStorage.clear();
                                    // Redirect to the signin page
                                    window.location.href = '/signin';
                                }}
                                style={{height: '100%', textDecoration: 'none', color: 'white'}}
                            >
                                Signout
                            </div>
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;