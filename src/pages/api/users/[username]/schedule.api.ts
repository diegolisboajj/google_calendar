import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import { getUserGoogleOAuthToken } from '@/lib/google'
import { format } from 'date-fns'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { name, email, date, observations } = req.body

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({
      message: `User with username "${username}" not found.`,
    })
  }

  const googleOAuth = await getUserGoogleOAuthToken(user.id)

  const calendar = google.calendar({
    version: 'v3',
    auth: googleOAuth,
  })

  const schedulingDate = dayjs(date).startOf('hour')

  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({
      message: 'Cannot create a scheduling in the past.',
    })
  }

  const conflictingScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: format(new Date(date), 'yyyy-MM-dd'),
    },
  })

  if (conflictingScheduling) {
    return res.status(400).json({
      message: 'There is another scheduling at the same time.',
    })
  }

  await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Ignite Call: ${name}`,
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: randomUUID(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })

  await prisma.scheduling.create({
    data: {
      date: schedulingDate.toDate(),
      name,
      email,
      observations,
      user_id: user.id,
    },
  })

  return res.status(201).end()
}
