import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'var(--surface)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'var(--surface)',
          },
        },
      }}
    />
  );
}
