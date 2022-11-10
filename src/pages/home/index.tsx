import { Heading, Text } from '@ignite-ui/react'
import Image from 'next/future/image'

import { Container, Content, PreviewContainer } from './styles'

import appPreviewImage from '@/assets/app-preview.png'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Descomplique sua agenda | Ignite Call</title>
      </Head>

      <Container>
        <Content>
          <Heading size="4xl">Agendamento descomplicado</Heading>
          <Text size="lg">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
            no seu tempo livre.
          </Text>

          <ClaimUsernameForm />
        </Content>
        <PreviewContainer>
          <Image
            src={appPreviewImage}
            height={400}
            quality={100}
            alt="Calendário simbolizando aplicação em funcionamento"
            priority
          />
        </PreviewContainer>
      </Container>
    </>
  )
}
