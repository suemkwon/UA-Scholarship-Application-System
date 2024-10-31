import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function awardInfo() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Create: Scholarship Award Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="awardName"
            name="awardName"
            label="Scholarship Award Name"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="awardAmount"
            name="awardAmount"
            label="Scholarship Award Amount"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="numAwardsAvailable"
            name="numAwardsAvailable"
            label="Number of Scholarship Awards Available"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="majors"
            name="majors"
            label="Majors"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="minors"
            name="minors"
            label="Minors"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="gpa"
            name="gpa"
            label="Minimum Required GPA"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="deadline"
            name="deadline"
            label="Scholarship Application Deadline"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="otherRequirements"
            name="otherRequirements"
            label="Other Requirements for Scholarship Award"
            fullWidth
            variant="standard"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}