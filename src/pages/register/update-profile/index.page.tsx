import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  Button,
  Heading,
  MultiStep,
  Text,
  TextArea,
} from '@ignite-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '@/lib/axios'
import { Container, Header } from '../styles'
import { Annotation, PictureInput, ProfileBox } from './styles'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '@/pages/api/auth/[...nextauth].api'

const updateProfileFormSchema = z.object({
  bio: z.string().nullable(),
})

type UpdateProfileFormData = z.input<typeof updateProfileFormSchema>

export default function UpdateProfile() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileFormSchema),
  })

  const router = useRouter()
  const session = useSession()

  async function handleUpdateProfile(data: UpdateProfileFormData) {
    try {
      await api.put('/users/profile', {
        bio: data.bio,
      })

      await router.push(`/schedule/${session.data.user.username}`)
    } catch (err) {
      if (err?.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        console.log(err)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Atualizar perfil | Ignite Call</title>
      </Head>

      <Container>
        <Header>
          <Heading as="strong">Finalize seu perfil</Heading>
          <Text>Por último, uma breve descrição e uma foto de perfil.</Text>

          <MultiStep size={4} currentStep={4} />
        </Header>

        <ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
          <label htmlFor="avatarUrl">
            <Text size="sm">Foto de perfil</Text>

            <PictureInput>
              {session.data.user && (
                <Avatar
                  src={session.data.user.avatar_url}
                  referrerPolicy="no-referrer"
                  alt={session.data.user.name}
                />
              )}
            </PictureInput>
          </label>

          <label>
            <Text size="sm">Sobre você</Text>
            <TextArea {...register('bio')} />
            <Annotation size="sm">
              Fale um pouco sobre você. Isto será exibido em sua página pessoal.
            </Annotation>
          </label>

          <Button type="submit" disabled={isSubmitting}>
            Finalizar
            <ArrowRight />
          </Button>
        </ProfileBox>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  return {
    props: {
      session,
    },
  }
}
