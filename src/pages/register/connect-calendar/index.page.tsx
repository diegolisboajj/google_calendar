import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import Link from 'next/link'
import { ArrowRight, Check } from 'phosphor-react'
import { useState } from 'react'
import { Container, Header } from '../styles'
import { ConnectBox, ConnectItem, FormError } from './styles'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '@/pages/api/auth/[...nextauth].api'

interface ConnectCalendarProps {
  hasConnectedCalendar: boolean
}

export default function ConnectCalendar({
  hasConnectedCalendar,
}: ConnectCalendarProps) {
  const router = useRouter()
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)

  const hasAuthError = !!router.query.error

  async function handleConnectCalendar() {
    setIsConnectingCalendar(true)

    await signIn('google', {
      callbackUrl: '/register/connect-calendar',
    })
  }

  return (
    <>
      <Head>
        <title>Conectar agenda do Google | Ignite Call</title>
      </Head>

      <Container>
        <Header>
          <Heading as="strong">Conecte sua agenda!</Heading>
          <Text>
            Conecte o seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medida em que são agendados.
          </Text>

          <MultiStep size={4} currentStep={2} />
        </Header>

        <ConnectBox>
          <ConnectItem>
            <Text>Google Agenda</Text>

            {hasConnectedCalendar ? (
              <Button size="sm" disabled>
                Conectado
                <Check />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleConnectCalendar}
                disabled={isConnectingCalendar}
              >
                Conectar
                <ArrowRight />
              </Button>
            )}
          </ConnectItem>

          {hasAuthError && (
            <FormError size="sm">
              Falha ao se conectar ao Google, verifique se você habilitou as
              permissões de acesso ao Google Calendar.
            </FormError>
          )}

          <Link href="/register/time-intervals">
            <Button as="a" aria-disabled={!hasConnectedCalendar}>
              Próximo passo
              <ArrowRight />
            </Button>
          </Link>
        </ConnectBox>
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
      hasConnectedCalendar: !!session,
    },
  }
}
