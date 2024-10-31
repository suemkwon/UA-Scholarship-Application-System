import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

type FormDataObject = {
    netID: string;
    applicationID: string;
    scholarshipID: string;
    firstName: string;
    lastName: string;
    essay: string;
    transcript: string;
    recommendationLetter: string;
};

export default function UpdateApplication() {
    const [netID, setNetID] = React.useState('');
    const [applicationID, setApplicationID] = React.useState('');
    const [scholarshipID, setScholarshipID] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [essay, setEssay] = React.useState('');
    const [transcript, setTranscript] = React.useState('');
    const [recommendationLetter, setRecommendationLetter] = React.useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject: FormDataObject = {} as FormDataObject;
    
        // Populate formObject with form data
        formData.forEach((value, key) =>{
            formObject[key as keyof FormDataObject] = value as string;
        });
        try {
            console.log('Form submitted:', formObject);
            const response = await axios.post('http://localhost:8000/createapplication/', formObject);
            console.log('Form submitted successfully:', response.data);
            // You might want to update your component's state here, or redirect the user to another page
        } catch (error) {
            console.error('Form submission error:', error);
            // You might want to update your component's state here to show an error message
        }
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" color="inherit" noWrap>
                        Scholarship Application
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
                <Paper variant="outlined" sx={{ p: 4 }}>
                    <Typography component="h1" variant="h4" align="center" sx={{ mb: 4 }}>
                        Apply for Scholarship
                    </Typography>
                    <form noValidate onSubmit={handleSubmit}>
                        <TextField
                            required
                            name='netID'
                            label="NetID"
                            fullWidth
                            value={netID}
                            onChange={(event) => setNetID(event.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            required
                            name='applicationID'
                            label="Application ID"
                            fullWidth
                            value={applicationID}
                            onChange={(event) => setApplicationID(event.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            required
                            name='scholarshipID'
                            label="Scholarship ID"
                            fullWidth
                            value={scholarshipID}
                            onChange={(event) => setScholarshipID(event.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            required
                            name='firstName'
                            label="First Name"
                            fullWidth
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            required
                            name='lastName'
                            label="Last Name"
                            fullWidth
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            sx={{ mb: 2 }}
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
                </Paper>
            </Container>
        </React.Fragment>
    );
}
