// src/layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div>
      <header style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        Admin Panel Header (Placeholder)
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet /> {/* Nested routes will render here */}
      </main>
      <footer style={{ padding: '1rem', backgroundColor: '#f0f0f0', textAlign: 'center', marginTop: 'auto' }}>
        Admin Panel Footer (Placeholder)
      </footer>
    </div>
  );
};
export default MainLayout;
