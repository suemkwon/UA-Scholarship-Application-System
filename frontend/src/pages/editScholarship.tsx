import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface EditScholarshipProps {
  selectedScholarship: {
    scholarshipName: string;
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
  };
  navigate: (path: string) => void;
}

const styles: { [key: string]: React.CSSProperties } = {
    form: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridGap: '1rem',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f4f4f4',
      borderRadius: '0.5rem',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem',
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: 'bold',
    },
    input: {
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    textarea: {
      resize: 'vertical',
    },
    button: {
      gridColumn: '1 / -1',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '0.25rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };

export default function EditScholarship() {
  const location = useLocation();
  const selectedScholarship = location.state.scholarship;
  const [initialValues, setInitialValues] = useState(selectedScholarship);
  const [formValues, setFormValues] = useState(selectedScholarship);
  const navigate = useNavigate();

  useEffect(() => {
    setInitialValues(selectedScholarship);
    setFormValues(selectedScholarship);
    let majorsArray = formValues.majors.split(' | ');
    let minorsArray = formValues.minors.split(' | ');
  }, [selectedScholarship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.put(`http://localhost:8000/scholarships/${formValues.scholarshipID}/`, formValues)
    .then(response => {
        navigate('/scholarships');
      // Handle successful update here, e.g. redirect to scholarship list
    })
    .catch(error => {
      console.error('Error updating scholarship:', error);
      // Handle error here, e.g. show error message to user
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prevState : any) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const formatDate = (dateString : any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
  
    if (month.length < 2) 
      month = '0' + month;
    if (day.length < 2) 
      day = '0' + day;
  
    return [year, month, day].join('-');
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Scholarship Name</label>
        <input
          name="scholarshipName"
          type="text"
          value={formValues.scholarshipName}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Award Amount</label>
        <input
          name="awardAmount"
          type="number"
          value={formValues.awardAmount}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Sponsor ID</label>
        <input
          name="sponsorID"
          type="text"
          value={formValues.sponsorID}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Number Available</label>
        <input
          name="numberAvailable"
          type="number"
          value={formValues.numberAvailable}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Majors</label>
        <input
          name="majors"
          type="text"
          value={formValues.majors}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Minors</label>
        <input
          name="minors"
          type="text"
          value={formValues.minors}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>GPA</label>
        <input
          name="gpa"
          type="number"
          value={formValues.gpa}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Deadline</label>
        <input
          name="deadline"
          type="date"
          value={formatDate(formValues.deadline)}
          style={styles.input}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Other Requirements</label>
        <textarea
          name="otherRequirements"
          rows={4}
          value={formValues.otherRequirements}
          style={{ ...styles.input, ...styles.textarea }}
          onChange={handleInputChange}
        />
      </div>
      <div style={styles.formGroup}>
        <button type="submit" style={styles.button}>
          Submit
        </button>
      </div>
    </form>
  );
}