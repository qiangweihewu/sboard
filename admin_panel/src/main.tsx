// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './tailwind.css';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

// 添加调试日志
console.log('🚀 Admin Panel starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// 检查必要的依赖是否加载
console.log('React version:', React.version);
console.log('Root element:', document.getElementById('root'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

console.log('✅ Admin Panel rendered successfully');
