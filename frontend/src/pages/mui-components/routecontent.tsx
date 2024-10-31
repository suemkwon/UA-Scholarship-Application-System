// MainContent.tsx
import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import SignIn from '../signin';
import SignUp from '../signup';
import Home from '../home';
import Scholarships from '../scholarships';
import CreateNewScholarship from '../createNewScholarship';
import AppMatch from '../appmatch';
import Applications from '../applications';
import Users from '../users';
import Navbar from './navbar';
import ProtectedRoute from './protectedroute';
import Application from '../application';
import EditScholarship from '../editScholarship';
import Reports from '../reports';

const RouteContent: React.FC = () => {
    const location = useLocation();
    const isSignInOrSignUp = location.pathname === '/signin' || location.pathname === '/signup';

    return (
        <div style={{
            backgroundColor: isSignInOrSignUp ? 'transparent' : 'white',
            minHeight: '100vh',
            maxHeight: '100vh', // Limit the height to the viewport height
            width: '85vw',
            zIndex: -1,
            margin: '0 auto',
            padding: '4rem',
            overflow: 'auto', // Make the content scrollable
        }}>
            <Navbar />
            <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={
                    <ProtectedRoute>
                        <Routes>
                            <Route path="/applicantmatch" element={<AppMatch />} />
                            <Route path="/applications" element={<Applications />} />
                            <Route path="/application/" element={<Application />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/scholarships" element={<Scholarships />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/createscholarship" element={<CreateNewScholarship />} />
                            <Route path="/editscholarship" element={<EditScholarship />} />
                        </Routes>
                    </ProtectedRoute>
                } />
            </Routes>
        <div style={{ height: '4rem' }}></div>
        </div>
    );
};

export default RouteContent;
