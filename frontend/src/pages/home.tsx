import React, { useEffect, useState } from 'react';

export default function Home() {
    const [firstName, setFirstName] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve the firstName and lastName from sessionStorage
        const storedFirstName = sessionStorage.getItem('firstName');

        // Update the state with the retrieved values
        if (storedFirstName) {
            setFirstName(storedFirstName);
        }
    }, []); // Empty dependency array means this effect runs once on component mount

    return (
        <div>
            <div style={{
                position: 'absolute',
            }}>
                <h1>Welcome {firstName}!</h1>
                <p></p>
            </div>
        </div>
    );
};