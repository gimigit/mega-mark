interface ListingPublishedEmailProps {
  listingTitle: string
  appUrl: string
}

export function ListingPublishedEmail({ listingTitle, appUrl }: ListingPublishedEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          AgroMark <span style={{ fontStyle: 'italic', color: '#fbbf24' }}>EU</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>Anunțul tău a fost publicat! 🎉</h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Anunțul tău <strong>"{listingTitle}"</strong> este acum live și vizibil pentru toți utilizatorii AgroMark EU.
        </p>
        
        <div style={{ backgroundColor: '#dcfce7', borderRadius: '8px', padding: '16px', marginTop: '24px', border: '1px solid #86efac' }}>
          <p style={{ color: '#166534', margin: 0, textAlign: 'center' }}>
            ✨ Anunțul tău este acum public și poate fi văzut de cumpărători din toată Europa!
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <a
            href={`${appUrl}/dashboard`}
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
            Vezi anunțul în dashboard
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          SFAT: Pentru a atrage mai mulți cumpărători, asigură-te că ai adăugat fotografii de calitate 
          și o descriere detaliată a utilajului.
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
