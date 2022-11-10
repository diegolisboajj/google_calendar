import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text, TextArea, TextInput } from '@ignite-ui/react'
import { useRouter } from 'next/router'
import { CalendarBlank, Clock } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/lib/axios'

import { Form, FormActions, FormError, FormHeader } from './styles'

const confirmFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Seu nome deve possuir pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  observations: z.string(),
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>

interface ConfirmStepProps {
  schedulingDate: Date
  onCancelConfirmation: () => void
}

export function ConfirmStep({
  schedulingDate,
  onCancelConfirmation,
}: ConfirmStepProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  })

  const router = useRouter()

  const { username } = router.query

  async function handleConfirmScheduling(data: ConfirmFormData) {
    try {
      await api.post(`/users/${username}/schedule`, {
        name: data.name,
        email: data.email,
        observations: data.observations,
        date: schedulingDate,
      })

      alert('Agendamento realizado com sucesso!')

      await router.push(`/${username}`)
    } catch (err) {
      if (err?.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        console.log(err)
      }
    }
  }

  const schedulingDateDescription = new Intl.DateTimeFormat('pt-br', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(schedulingDate)

  const schedulingTimeDescription = new Intl.DateTimeFormat('pt-br', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(schedulingDate)

  return (
    <Form as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {schedulingDateDescription}
        </Text>
        <Text>
          <Clock />
          {`${schedulingTimeDescription}h`}
        </Text>
      </FormHeader>

      <label>
        <Text size="sm">Nome completo</Text>
        <TextInput placeholder="Seu nome" {...register('name')} />
        {errors.name && <FormError size="sm">{errors.name.message}</FormError>}
      </label>

      <label>
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput
          type="email"
          placeholder="johndoe@example.com"
          {...register('email')}
        />
        {errors.email && (
          <FormError size="sm">{errors.email.message}</FormError>
        )}
      </label>

      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register('observations')} />
      </label>

      <FormActions>
        <Button variant="tertiary" type="button" onClick={onCancelConfirmation}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Confirmar
        </Button>
      </FormActions>
    </Form>
  )
}
