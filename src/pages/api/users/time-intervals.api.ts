import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

type TimeIntervals = Array<{
  weekDay: number
  startTimeInMinutes: number
  endTimeInMinutes: number
}>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return res
      .status(401)
      .json({ message: 'You must be logged in to manage your time intervals.' })
  }

  const intervals = req.body.intervals as TimeIntervals

  await prisma.userTimeInterval.createMany({
    data: intervals.map((interval) => {
      return {
        user_id: session.user.id,
        week_day: interval.weekDay,
        time_start_in_minutes: interval.startTimeInMinutes,
        time_end_in_minutes: interval.endTimeInMinutes,
      }
    }),
  })

  return res.status(201).end()
}
