interface ListingExpiringEmailProps {
  listingTitle: string
  daysUntilExpiry: number
  appUrl: string
}

export function ListingExpiringEmail({ listingTitle, daysUntilExpiry, appUrl }: ListingExpiringEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          AgroMark <span style={{ fontStyle: 'italic', color: '#fbbf24' }}>EU</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>⏰ Anunțul expiră curând!</h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Anunțul tău <strong>"{listingTitle}"</strong> va expira în {daysUntilExpiry} {daysUntilExpiry === 1 ? 'zi' : 'zile'}.
        </p>
        
        <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', marginTop: '24px', border: '1px solid #fcd34d' }}>
          <p style={{ color: '#92400e', margin: 0, textAlign: 'center', fontWeight: 'bold' }}>
            {daysUntilExpiry <= 3 ? '⚠️ Acțiune necesară!' : '💡 Sfat util:'}
          </p>
          <p style={{ color: '#92400e', margin: '8px 0 0', textAlign: 'center' }}>
            {daysUntilExpiry <= 3 
              ? 'Prelungește anunțul pentru a nu pierde vizibilitate!'
              : 'Nu uita să prelungești anunțul când expiră.'}
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
            Gestionează anunțul
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Anunțurile expirate nu mai sunt vizibile cumpărătorilor. Poți oricând să reactivați anunțul 
          din dashboard.
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
