import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: { token: string }
  }
) {
  const { token } = params

  const user = await prisma.user.findFirst({
    where: {
      activateTokens: {
        some: {
          AND: [
            {
              activatedAt: null,
            },
            {
              createdAt: {
                gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
              },
            },
          ],
        },
      },
    },
  })

  if (!user) {
    throw new Error('Token is invalid or expired')
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      active: true,
    },
  })

  await prisma.activateToken.update({
    where: {
      token,
    },
    data: {
      activatedAt: new Date(),
    },
  })

  redirect('/api/auth/signin')
}
