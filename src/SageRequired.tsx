export function SageRequired() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f1115',
        color: '#e8ecf1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          width: '100%',
          background: '#171a21',
          border: '1px solid #2a2f3a',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: 28 }}>Permission Probe</h1>
        <p style={{ margin: 0, color: '#9aa4b2', lineHeight: 1.6 }}>
          This app is intended to run inside Sage and requires the Sage runtime
          bridge to be available.
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 12,
            border: '1px solid #242b38',
            background: '#11151d',
            color: '#cdd6e3',
            lineHeight: 1.6,
          }}
        >
          Open this app through Sage after installing it as a Sage app.
        </div>
      </div>
    </div>
  );
}
