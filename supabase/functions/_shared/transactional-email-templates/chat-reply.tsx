/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'SAFEViN'

interface ChatReplyProps {
  name?: string
  chatLabel?: string
  chatUrl?: string
}

const ChatReplyEmail = ({ name, chatLabel, chatUrl }: ChatReplyProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Hai una nuova risposta in {chatLabel ?? SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, hai una nuova risposta` : 'Hai una nuova risposta'}
        </Heading>
        <Text style={text}>
          Il team {SITE_NAME} ti ha risposto in{' '}
          <strong>{chatLabel ?? 'una delle tue chat'}</strong>. Apri la
          conversazione per leggere il messaggio e continuare.
        </Text>
        <Button style={button} href={chatUrl ?? 'https://www.safevinengine.com'}>
          Apri la conversazione
        </Button>
        <Text style={footer}>
          Riceverai al massimo una notifica ogni 30 minuti per la stessa
          conversazione.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ChatReplyEmail,
  subject: (data: Record<string, any>) =>
    `Nuova risposta in ${data?.chatLabel ?? SITE_NAME}`,
  displayName: 'Notifica risposta chat',
  previewData: {
    name: 'Marco',
    chatLabel: 'Artist Director',
    chatUrl: 'https://www.safevinengine.com/artist-director',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  fontFamily: 'Poppins, Arial, sans-serif',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#3f4548',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#8a9296', margin: '32px 0 0' }
