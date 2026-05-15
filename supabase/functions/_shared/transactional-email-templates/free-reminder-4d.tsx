/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const FreeReminder4dEmail = ({ name }: Props) => {
  const adLink = `${SITE_URL}/engine/studio`
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Usa il tuo annuncio gratuito su Safevin</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Ciao {name || 'utente'},</Text>
          <Text style={text}>
            Quando ti sei registrato su SAFEViN ti abbiamo regalato un annuncio gratuito da usare quando vuoi.
          </Text>
          <Text style={text}>
            È ancora lì, inutilizzato.
          </Text>
          <Text style={text}>
            Lo so, all'inizio sembra un'altra cosa da imparare. Ma ti prometto: ci vogliono meno di 60 secondi. Copi il titolo del tuo articolo su Vinted, incolli la descrizione, e SAFEViN riscrive tutto — titolo ottimizzato, keywords giuste, tono professionale.
          </Text>
          <Text style={text}>
            Nessuna carta di credito. Nessun rischio. Solo un annuncio che converte meglio di quello che hai adesso.
          </Text>
          <Button style={button} href={adLink}>Usa il mio annuncio gratuito</Button>
          <Text style={text}>
            Se non sai da dove iniziare, prova con un articolo che non riesci a vendere da settimane. I risultati ti sorprenderanno.
          </Text>
          <Text style={signature}>Simone</Text>
          <Text style={signatureRole}>Fondatore, SAFEViN</Text>
          <Text style={ps}>
            P.S. — La maggior parte di chi prova SAFEViN torna a usarlo entro 24 ore dal primo annuncio. Non perché deve, ma perché funziona.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: FreeReminder4dEmail,
  subject: 'Hai ancora 1 annuncio gratis che ti aspetta 👀',
  displayName: 'Reminder prova 4 giorni',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 16px' }
const signature = { fontSize: '15px', color: '#0f1719', fontWeight: 'bold' as const, margin: '24px 0 0' }
const signatureRole = { fontSize: '14px', color: '#0f1719', margin: '0 0 16px' }
const ps = { fontSize: '14px', color: '#3f4548', lineHeight: '1.6', margin: '16px 0 0', fontStyle: 'italic' as const }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', margin: '8px 0 20px', display: 'inline-block' }
