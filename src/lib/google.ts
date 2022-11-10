import dayjs from 'dayjs'
import { google } from 'googleapis'
import { prisma } from './prisma'

export async function getUserGoogleOAuthToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      user_id: userId,
      provider: 'google',
    },
  })

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at,
  })

  const shouldRefreshToken = dayjs(account.expires_at * 1000).isBefore(
    new Date(),
  )

  if (shouldRefreshToken) {
    const {
      credentials: {
        access_token,
        expiry_date,
        id_token,
        refresh_token,
        scope,
        token_type,
      },
    } = await auth.refreshAccessToken()

    const expires_at = Math.floor(expiry_date / 1000)

    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token,
        refresh_token,
        expires_at,
        id_token,
        scope,
        token_type,
      },
    })

    auth.setCredentials({
      access_token,
      refresh_token,
      expiry_date: expires_at,
    })
  }

  return auth
}
