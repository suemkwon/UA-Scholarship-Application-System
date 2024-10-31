import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

export default function donorInfo() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Scholarship Donor Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="awardDonor"
            label="Donor Name"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} >
          <TextField
            required
            id="donorPhone"
            label="Donor Phone Number"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} >
          <TextField
            required
            id="donorEmail"
            label="Donor Email Address"
            fullWidth
            variant="standard"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}