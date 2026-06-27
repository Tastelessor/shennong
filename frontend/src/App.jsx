import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { I18nProvider } from './features/i18n/I18nProvider';
import { SocketProvider } from './providers/SocketProvider'; // 管理 Socket 连接
import { router } from './routes';
import './styles/globals.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <h1 className="text-center mt-20">Something went wrong.</h1>;
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <SocketProvider>
            <RouterProvider router={router} />
          </SocketProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}