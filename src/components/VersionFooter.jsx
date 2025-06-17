export default function VersionFooter() {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  return (
    <footer style={{ marginTop: 16, color: '#aaa', fontSize: 13, textAlign: 'center' }}>
      v{version}
    </footer>
  );
}
