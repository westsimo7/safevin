/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const FreeReminder24hEmail = ({ name }: Props) => {
  const adLink = `${SITE_URL}/engine/studio`
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Il tuo annuncio gratuito è ancora inattivo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Ciao {name || 'utente'},</Text>
          <Text style={text}>il tuo annuncio gratuito è ancora inattivo.</Text>
          <Text style={text}>
            Molti utenti si registrano e rimandano… poi non sfruttano mai l'opportunità di ottenere traffico e visibilità gratuita.
          </Text>
          <Text style={text}>Safevin è pensato proprio per partire velocemente:</Text>
          <ul style={list}>
            <li style={li}>pubblichi in pochi minuti</li>
            <li style={li}>ottieni subito esposizione</li>
            <li style={li}>testi la piattaforma senza rischi</li>
          </ul>
          <Text style={text}>👉 Attiva ora il tuo annuncio gratuito:</Text>
          <Button style={button} href={adLink}>Attiva il mio annuncio</Button>
          <Text style={text}>
            Una volta online, capirai subito il potenziale della piattaforma.
          </Text>
          <Text style={signature}>— Team Safevin.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: FreeReminder24hEmail,
  subject: 'Il tuo annuncio gratuito è ancora inattivo',
  displayName: 'Reminder prova 24h',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 16px' }
const list = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 16px', paddingLeft: '20px' }
const li = { margin: '4px 0' }
const signature = { fontSize: '15px', color: '#0f1719', margin: '24px 0 0' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', margin: '8px 0 20px', display: 'inline-block' }
