import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

type FormDataObject = {
    userID: string;
    applicationID: string;
    scholarshipID: string;
    firstName: string;
    lastName: string;
    essay: string;
    transcript: string;
    recommendationLetter: string;
};

export default function Application() {
    const [netID, setNetID] = React.useState(sessionStorage.getItem('net_id') || '');
    const [applicationID, setApplicationID] = React.useState('');
    const [scholarshipID, setScholarshipID] = React.useState('');
    const [firstName, setFirstName] = React.useState(sessionStorage.getItem('firstName') || '');
    const [lastName, setLastName] = React.useState(sessionStorage.getItem('lastName') || '');
    const [essay, setEssay] = React.useState('');
    const [transcript, setTranscript] = React.useState('');
    const [recommendationLetter, setRecommendationLetter] = React.useState('');
    const [studentID, setStudentID] = React.useState(sessionStorage.getItem('student_id') || '');

    const selectedScholarship = sessionStorage.getItem('selectedScholarship');
    const selectedScholarshipId = sessionStorage.getItem('selectedScholarshipId');
    const applicationId = selectedScholarshipId +  studentID; // Create application ID

    // Get student from user


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject: FormDataObject = {} as FormDataObject;
    
        // Populate formObject with form data
        formData.forEach((value, key) =>{
            formObject[key as keyof FormDataObject] = value as string;
        });
        formObject.scholarshipID = sessionStorage.getItem('selectedScholarshipId') || '';
        formObject.applicationID = applicationId;
        formObject.userID = netID;  
        formObject.firstName = firstName;
        formObject.lastName = lastName;
        try {
            console.log('Form submitted:', formObject);
            const response = await axios.post('http://localhost:8000/createapplication/', formObject);
            console.log('Form submitted successfully:', response.data);
            alert('Application submitted successfully');
            window.location.href = '/scholarships';
        } catch (error) {
            console.error('Form submission error:', error);
            // You might want to update your component's state here to show an error message
        }
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Typography marginTop={10} component="h1" variant="h4" align="center" sx={{ mb: 4 }}>
                {sessionStorage.getItem('selectedScholarshipName')} Scholarship
            </Typography>
            <form noValidate onSubmit={handleSubmit}>
                <TextField
                    required
                    name='net_id'
                    label= 'NetID'
                    fullWidth
                    value={netID}
                    onChange={(event) => setNetID(event.target.value)}
                    sx={{ mb: 2 }}
                    disabled // disable editing for netID
                />
                <TextField
                    required
                    name='applicationID'
                    label="Application ID"
                    fullWidth
                    value={applicationId}
                    onChange={(event) => setApplicationID(event.target.value)}
                    sx={{ mb: 2 }}
                    disabled  // disable editing for applicationID
                />
                <TextField
                    required
                    name='firstName'
                    label="First Name"
                    fullWidth
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    sx={{ mb: 2 }}
                    disabled // disable editing for firstName
                />
                <TextField
                    required
                    name='lastName'
                    label="Last Name"
                    fullWidth
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    sx={{ mb: 2 }}
                    disabled // disable editing for lastName
                />
                <TextField
                    required
                    name='essay'
                    label="Essay"
                    fullWidth
                    multiline
                    rows={4}
                    value={essay}
                    onChange={(event) => setEssay(event.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    name='transcript'
                    label="Transcript"
                    fullWidth
                    multiline
                    rows={4}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    name='recommendationLetter'
                    label="Recommendation Letter"
                    fullWidth
                    multiline
                    rows={4}
                    value={recommendationLetter}
                    onChange={(event) => setRecommendationLetter(event.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" fullWidth>
                    Submit Application
                </Button>
            </form>
        </React.Fragment>
    );
}
