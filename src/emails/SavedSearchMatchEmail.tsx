interface SavedSearchMatchEmailProps {
  searchName: string
  listingTitle: string
  listingPrice?: number
  listingCurrency?: string
  listingLocation?: string
  listingUrl: string
  appUrl: string
}

export function SavedSearchMatchEmail({
  searchName,
  listingTitle,
  listingPrice,
  listingCurrency = 'EUR',
  listingLocation,
  listingUrl,
  appUrl,
}: SavedSearchMatchEmailProps) {
  const priceFormatted = listingPrice 
    ? new Intl.NumberFormat('ro-RO', { style: 'currency', currency: listingCurrency }).format(listingPrice)
    : 'Preț la cerere'

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          Mega<span style={{ fontStyle: 'italic', color: '#fbbf24' }}>Mark</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>
          Anunț nou: {searchName}
        </h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          Am găsit un anunț nou care se potrivește cu cautarea ta salvată:
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#111827', marginTop: 0, marginBottom: '8px' }}>
            {listingTitle}
          </h3>
          
          <p style={{ 
            color: '#166534', 
            fontSize: '20px', 
            fontWeight: 'bold',
            marginTop: '8px',
            marginBottom: '8px'
          }}>
            {priceFormatted}
          </p>
          
          {listingLocation && (
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              📍 {listingLocation}
            </p>
          )}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <a
            href={listingUrl}
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
            Vezi anunțul
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Dacă nu mai dorești să primești notificări pentru "{searchName}", 
          <a href={`${appUrl}/dashboard/saved-searches`} style={{ color: '#166534' }}>
            gestionează cautările tale salvate
          </a>.
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