import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouteContent from './pages/mui-components/routecontent';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <div style={{
                backgroundImage: 'url(/UofA1.jpeg)',
                backgroundSize: 'cover',
                height: '100vh',
                width: '100%',
                position: 'fixed',
                zIndex: -1,
            }}>
                <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    height: '100vh',
                    width: '100vw',
                    position: 'absolute',
                    zIndex: -1,
                }}></div>
                <RouteContent />
            </div>
        </BrowserRouter>
    );
};

export default AppRoutes;