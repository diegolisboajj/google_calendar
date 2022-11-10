import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { year = null, month = null } = req.query

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

  if (!year || !month) {
    return res.status(400).json({
      message: `Please provide the year and month.`,
    })
  }

  const compareYearAndMonth = `${year}-${String(month).padStart(2, '0')}`

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter(
    (weekDay) =>
      !availableWeekDays.some(
        (availableWeekDay) => availableWeekDay.week_day === weekDay,
      ),
  )

  const blockedDatesResponse: Array<{ date: string }> = await prisma.$queryRaw`
    SELECT 
    EXTRACT(DAY FROM S.date) AS date,
    COUNT(S.date) as amount,
    CAST((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60 AS UNSIGNED) as size
    FROM schedulings AS S

    LEFT JOIN user_time_intervals UTI
      ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))

    WHERE DATE_FORMAT(S.date, "%Y-%m") = ${compareYearAndMonth}
      AND S.user_id = ${user.id}

    GROUP BY EXTRACT(DAY FROM S.date),
      CAST((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60 AS UNSIGNED)

    HAVING amount >= size 
        OR size = 0
  `

  const blockedDates = blockedDatesResponse.map((item) => {
    return item.date
  })

  return res.json({ blockedDates, blockedWeekDays })
}
