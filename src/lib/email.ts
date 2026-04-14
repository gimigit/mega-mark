import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Mega-Mark <noreply@megamark.eu>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface EmailOptions {
  to: string
  subject: string
  react: React.ReactElement
}

async function sendEmail({ to, subject, react }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
  })

  if (error) {
    console.error('Failed to send email:', error)
    return null
  }

  return data
}

export async function sendWelcomeEmail(to: string, name: string) {
  const { WelcomeEmail } = await import('@/emails/WelcomeEmail')
  return sendEmail({
    to,
    subject: 'Bine ai venit pe AgroMark EU!',
    react: WelcomeEmail({ name, appUrl: APP_URL }),
  })
}

export async function sendNewMessageEmail(
  to: string,
  senderName: string,
  preview: string,
  listingTitle?: string
) {
  const { NewMessageEmail } = await import('@/emails/NewMessageEmail')
  return sendEmail({
    to,
    subject: `Mesaj nou de la ${senderName}`,
    react: NewMessageEmail({
      senderName,
      preview,
      listingTitle,
      appUrl: APP_URL,
    }),
  })
}

export async function sendListingPublishedEmail(to: string, listingTitle: string) {
  const { ListingPublishedEmail } = await import('@/emails/ListingPublishedEmail')
  return sendEmail({
    to,
    subject: 'Anunțul tău a fost publicat!',
    react: ListingPublishedEmail({ listingTitle, appUrl: APP_URL }),
  })
}

export async function sendListingExpiringEmail(
  to: string,
  listingTitle: string,
  daysUntilExpiry: number
) {
  const { ListingExpiringEmail } = await import('@/emails/ListingExpiringEmail')
  return sendEmail({
    to,
    subject: `Anunțul "${listingTitle}" expiră în ${daysUntilExpiry} zile`,
    react: ListingExpiringEmail({
      listingTitle,
      daysUntilExpiry,
      appUrl: APP_URL,
    }),
  })
}

export async function sendNewReviewEmail(
  to: string,
  reviewerName: string,
  rating: number,
  listingTitle: string
) {
  const { NewReviewEmail } = await import('@/emails/NewReviewEmail')
  return sendEmail({
    to,
    subject: `${reviewerName} ți-a trimis o recenzie!`,
    react: NewReviewEmail({
      reviewerName,
      rating,
      listingTitle,
      appUrl: APP_URL,
    }),
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { PasswordResetEmail } = await import('@/emails/PasswordResetEmail')
  return sendEmail({
    to,
    subject: 'Resetare parolă Mega-Mark',
    react: PasswordResetEmail({ resetUrl }),
  })
}

// Cron job email functions
export async function sendAdExpiringEmail(opts: {
  to: string
  userName: string
  listingTitle: string
  listingId: string
  daysUntilExpiry: number
}) {
  return sendListingExpiringEmail(opts.to, opts.listingTitle, opts.daysUntilExpiry)
}

export async function sendAdExpiredEmail(opts: {
  to: string
  userName: string
  listingTitle: string
  listingId: string
  listingSlug?: string
}) {
  const { ListingExpiringEmail } = await import('@/emails/ListingExpiringEmail')
  return sendEmail({
    to: opts.to,
    subject: `Anunțul "${opts.listingTitle}" a expirat`,
    react: ListingExpiringEmail({
      listingTitle: opts.listingTitle,
      daysUntilExpiry: 0,
      appUrl: APP_URL,
    }),
  })
}
