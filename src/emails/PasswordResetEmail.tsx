interface PasswordResetEmailProps {
  resetUrl: string
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          AgroMark <span style={{ fontStyle: 'italic', color: '#fbbf24' }}>EU</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>Resetare parolă</h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Ai primit acest email pentru că ai solicitat resetarea parolei pentru contul tău AgroMark EU.
        </p>
        
        <div style={{ backgroundColor: '#fee2e2', borderRadius: '8px', padding: '16px', marginTop: '24px', border: '1px solid #fca5a5' }}>
          <p style={{ color: '#991b1b', margin: 0, textAlign: 'center', fontSize: '14px' }}>
            ⚠️ Dacă nu ai solicitat resetarea parolei, te rugăm să ignori acest email. 
            Contul tău este în siguranță.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <a
            href={resetUrl}
            style={{
              backgroundColor: '#166534',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Resetează parola
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Acest link de resetare este valid pentru 1 oră. Dacă link-ul a expirat, 
          poți solicita unul nou din pagina de login.
        </p>
      </div>
      
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
          © 2026 AgroMark EU. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  )
}
