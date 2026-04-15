import { Component } from 'react';

/**
 * React Error Boundary
 * Catches runtime errors in child components, shows graceful fallback
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Pandoos Error Boundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        height:         '100dvh',
        background:     '#060608',
        color:          '#f4f4f8',
        gap:            '16px',
        padding:        '24px',
        textAlign:      'center',
        fontFamily:     "'Nunito', sans-serif",
      }}>
        <div style={{ fontSize: '4rem' }}>🐼</div>
        <h1 style={{ fontFamily:"'Baloo 2', sans-serif", fontSize:'1.5rem', fontWeight:800 }}>
          Oops! Something went wrong
        </h1>
        <p style={{ color:'#6c6c88', maxWidth:360, fontSize:'0.875rem' }}>
          {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding:       '10px 24px',
            background:    '#22c55e',
            color:         '#060608',
            borderRadius:  '9999px',
            fontWeight:    800,
            fontSize:      '0.875rem',
            cursor:        'pointer',
            border:        'none',
            marginTop:     '8px',
          }}
        >
          Refresh App
        </button>
        {import.meta.env.DEV && (
          <pre style={{
            marginTop:   '16px',
            background:  '#1c1c26',
            padding:     '12px',
            borderRadius:'8px',
            fontSize:    '11px',
            color:       '#ef4444',
            maxWidth:    '600px',
            overflow:    'auto',
            textAlign:   'left',
            maxHeight:   '200px',
          }}>
            {this.state.error?.stack}
          </pre>
        )}
      </div>
    );
  }
}
