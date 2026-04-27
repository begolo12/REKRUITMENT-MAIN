import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log error ke monitoring service (jika ada)
    console.error('Error Boundary caught:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#fef2f2',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={40} color="#dc2626" />
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '12px'
            }}>
              Terjadi Kesalahan
            </h2>
            
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: 1.6
            }}>
              Maaf, aplikasi mengalami masalah. Silakan refresh halaman atau coba lagi nanti.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
                overflow: 'auto'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRefresh}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <RefreshCw size={18} />
                Refresh Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
