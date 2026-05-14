/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const FreeReminder48hEmail = ({ name: _name }: Props) => {
  const adLink = `${SITE_URL}/engine/studio`
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Ultimo promemoria — il tuo annuncio gratuito ti aspetta</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>
            C'è ancora un annuncio gratuito disponibile sul tuo account Safevin.
          </Text>
          <Text style={text}>
            Se non lo utilizzi, perderai la possibilità di testare gratuitamente la piattaforma e vedere come funziona realmente.
          </Text>
          <Text style={text}>👉 Usa ora il tuo annuncio gratuito:</Text>
          <Button style={button} href={adLink}>Usa il mio annuncio</Button>
          <Text style={text}>Bastano pochi minuti per pubblicarlo.</Text>
          <Text style={signature}>— Team Safevin.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: FreeReminder48hEmail,
  subject: 'Ultimo promemoria — il tuo annuncio gratuito ti aspetta',
  displayName: 'Reminder prova 48h',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 16px' }
const signature = { fontSize: '15px', color: '#0f1719', margin: '24px 0 0' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', margin: '8px 0 20px', display: 'inline-block' }
