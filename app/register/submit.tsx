'use client'

import { Button } from 'lotus-ux'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'

export const Submit = () => {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" loading={pending}>
      Create Account
    </Button>
  )
}
