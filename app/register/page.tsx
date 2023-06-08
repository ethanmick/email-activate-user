import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { randomUUID } from 'crypto'
import formData from 'form-data'
import { TextField } from 'lotus-ux'
import Mailgun from 'mailgun.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Submit } from './submit'

const API_KEY = process.env.MAILGUN_API_KEY || ''
const DOMAIN = process.env.MAILGUN_DOMAIN || ''

export default function RegisterPage() {
  async function createUser(data: FormData) {
    'use server'

    const password = await hash(data.get('password') as string, 12)

    const user = await prisma.user.create({
      data: {
        name: data.get('name') as string,
        email: data.get('email') as string,
        password,
      },
    })
    if (!user) {
      return { error: 'Something went wrong' }
    }

    const token = await prisma.activateToken.create({
      data: {
        userId: user.id,
        token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ''),
      },
    })

    const mailgun = new Mailgun(formData)
    const client = mailgun.client({ username: 'api', key: API_KEY })

    const messageData = {
      from: `Example Email <hello@${DOMAIN}>`,
      to: user.email,
      subject: 'Please Activate Your Account',
      text: `Hello ${user.name}, please activate your account by clicking this link: http://localhost:3000/activate/${token.token}`,
    }

    await client.messages.create(DOMAIN, messageData)

    redirect('/register/success')
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-slate-100">
      <div className="sm:shadow-xl px-8 pb-8 pt-12 sm:bg-white rounded-xl space-y-12 w-[500px]">
        <h1 className="font-semibold text-2xl">Create your Account</h1>
        <form action={createUser} className="space-y-4">
          <TextField label="Name" name="name" type="text" />
          <TextField label="Email" name="email" type="email" isRequired />
          <TextField
            label="Password"
            name="password"
            type="password"
            isRequired
          />
          <Submit />
        </form>
        <p>
          Have an account?{' '}
          <Link className="text-indigo-500 hover:underline" href="/login">
            Sign in
          </Link>{' '}
        </p>
      </div>
    </div>
  )
}
