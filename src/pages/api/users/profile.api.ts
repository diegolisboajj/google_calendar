import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
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
      .json({ message: 'You must be logged in to update your profile.' })
  }

  const { bio } = req.body

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      about: bio,
    },
  })

  return res.status(204).end()
}
