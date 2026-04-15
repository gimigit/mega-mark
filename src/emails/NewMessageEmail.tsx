interface NewMessageEmailProps {
  senderName: string
  preview: string
  listingTitle?: string
  appUrl: string
}

export function NewMessageEmail({ senderName, preview, listingTitle, appUrl }: NewMessageEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          Mega<span style={{ fontStyle: 'italic', color: '#fbbf24' }}>Mark</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>Ai primit un mesaj nou!</h2>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginTop: '24px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#166534',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              marginRight: '16px',
            }}>
              {senderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>{senderName}</p>
              {listingTitle && (
                <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>📦 {listingTitle}</p>
              )}
            </div>
          </div>
          
          <p style={{ color: '#374151', lineHeight: '1.6', margin: 0 }}>
            "{preview.length > 200 ? preview.substring(0, 200) + '...' : preview}"
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
          <a
            href={`${appUrl}/dashboard?tab=messages`}
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
            Răspunde acum
          </a>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Dacă nu recunoști acest mesaj sau pare suspect, te rugăm să ne contactezi imediat.
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
