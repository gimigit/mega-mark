interface NewReviewEmailProps {
  reviewerName: string
  rating: number
  listingTitle: string
  appUrl: string
}

function renderStars(rating: number) {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
}

export function NewReviewEmail({ reviewerName, rating, listingTitle, appUrl }: NewReviewEmailProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#166534', padding: '24px', textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          Mega<span style={{ fontStyle: 'italic', color: '#fbbf24' }}>Mark</span>
        </h1>
      </div>
      
      <div style={{ padding: '32px 24px', backgroundColor: '#f9fafb' }}>
        <h2 style={{ color: '#111827', marginTop: 0 }}>Ai primit o recenzie nouă! ⭐</h2>
        
        <p style={{ color: '#374151', lineHeight: '1.6' }}>
          <strong>{reviewerName}</strong> ți-a trimis o recenzie pentru anunțul <strong>"{listingTitle}"</strong>.
        </p>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginTop: '24px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', margin: 0, letterSpacing: '4px' }}>{renderStars(rating)}</p>
          <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '14px' }}>
            Rating {rating}/5 stele
          </p>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
          Recenziile sunt importante pentru credibilitatea ta pe platformă. 
          Cu cât ai mai multe recenzii pozitive, cu atât mai mulți cumpărători vor avea încredere în tine!
        </p>
        
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
            Vezi recenzia
          </a>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
          © 2026 Mega-Mark. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  )
}
