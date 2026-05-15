/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const FreeReminder5dEmail = ({ name }: Props) => {
  const adLink = `${SITE_URL}/engine/studio`
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Il segreto dei venditori che vendono di più su Vinted</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={text}>Ciao {name || 'utente'},</Text>
          <Text style={text}>
            Ho guardato i dati degli ultimi mesi e ho notato una cosa interessante.
          </Text>
          <Text style={text}>
            I venditori che ottengono più offerte su Vinted non sono necessariamente quelli con i prezzi più bassi, né quelli con il guardaroba più bello.
          </Text>
          <Text style={text}>
            Sono quelli con gli annunci migliori.
          </Text>
          <Text style={text}>
            Titolo chiaro. Descrizione che risponde alle domande prima ancora che vengano fatte. Parole che fanno sentire l'acquirente sicuro di cliccare "compra subito".
          </Text>
          <Text style={text}>
            È quello che fa SAFEViN, in automatico, per ogni articolo.
          </Text>
          <Text style={text}>
            Hai ancora il tuo annuncio gratuito disponibile. Usalo su quell'articolo che vorresti davvero riuscire a vendere — e guarda cosa succede.
          </Text>
          <Button style={button} href={adLink}>Prova adesso — è gratis</Button>
          <Text style={signature}>Simone</Text>
          <Text style={signatureRole}>Fondatore, SAFEViN</Text>
          <Text style={ps}>
            P.S. — "Ho usato SAFEViN su una felpa Nike che era in vetrina da 3 settimane. Venduta in 2 giorni." — Giulia, venditrice da Milano. Il tuo annuncio gratuito è ancora qui che ti aspetta.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: FreeReminder5dEmail,
  subject: 'Cosa fanno i venditori Vinted che vendono di più (non è quello che pensi)',
  displayName: 'Reminder prova 5 giorni',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 16px' }
const signature = { fontSize: '15px', color: '#0f1719', fontWeight: 'bold' as const, margin: '24px 0 0' }
const signatureRole = { fontSize: '14px', color: '#0f1719', margin: '0 0 16px' }
const ps = { fontSize: '14px', color: '#3f4548', lineHeight: '1.6', margin: '16px 0 0', fontStyle: 'italic' as const }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', margin: '8px 0 20px', display: 'inline-block' }
