interface WelcomeEmailProps {
  name: string
  appUrl: string
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          Mega<span style={{ fontStyle: 'italic', color: '#fbbf24' }}>Mark</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>Bine ai venit, {name}!</h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Suntem încântați să te avem alături pe Mega-Mark, platforma de anunțuri pentru 
          utilaje agricole din Europa.
        </p>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Poți acum să:
        </p>
        
        <ul style={{ color: '#374151', lineHeight: '1.8' }}>
          <li>Publici anunțuri pentru utilajele tale agricole</li>
          <li>Cauți printre sute de oferte din toată Europa</li>
          <li>Contactezi direct vânzătorii și cumpărătorii</li>
          <li>Salvezi anunțurile favorite</li>
        </ul>
        
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <a
            href={`${appUrl}/browse`}
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
            Începe să răsfoiești
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
          Dacă ai întrebări, nu ezita să ne contactezi.
        </p>
      </div>
      
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
          © 2026 Mega-Mark. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  )
}
