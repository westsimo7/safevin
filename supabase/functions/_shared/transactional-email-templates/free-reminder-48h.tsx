/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'SAFEViN'
const SITE_URL = 'https://www.safevinengine.com'

interface Props { name?: string }

const FreeReminder48hEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Ultimo promemoria — il tuo annuncio prova gratuito è ancora lì</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, non lasciare lì il tuo annuncio prova` : 'Non lasciare lì il tuo annuncio prova'}
        </Heading>
        <Text style={text}>
          Sono passate 48 ore dalla tua registrazione. Il tuo annuncio prova
          gratuito è ancora disponibile: caricalo in pochi minuti e vedi tu
          stesso come {SITE_NAME} ti aiuta a vendere più velocemente su Vinted.
        </Text>
        <Button style={button} href={`${SITE_URL}/engine/studio`}>
          Usa il mio annuncio prova
        </Button>

        <Hr style={hr} />
        <Text style={subTitle}>Oppure passa direttamente a un piano</Text>

        <Section style={planBox}>
          <Text style={planLabel}>STARTER · Offerta lancio</Text>
          <Text style={planPrice}>5,99€ <span style={oldPrice}>8,99€</span> <span style={perMonth}>/ mese</span></Text>
          <Text style={planDetail}>• 10 annunci creabili<br />• Prezzo strategico</Text>
        </Section>

        <Section style={planBoxPro}>
          <Text style={planLabelPro}>PRO · Più scelto</Text>
          <Text style={planPrice}>12,99€ <span style={oldPrice}>15,99€</span> <span style={perMonth}>/ mese</span></Text>
          <Text style={planDetail}>
            • 25 annunci creabili<br />
            • Prezzo strategico avanzato<br />
            • Accesso alla SAFEViN Artist Direction<br />
            • 2 annunci delegabili al team SAFEViN Artist Direction
          </Text>
        </Section>

        <Button style={buttonOutline} href={`${SITE_URL}/pricing`}>
          Scopri tutti i piani
        </Button>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeReminder48hEmail,
  subject: 'Ultimo promemoria — il tuo annuncio prova ti aspetta',
  displayName: 'Reminder prova 48h',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const subTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 24px' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none' }
const buttonOutline = { backgroundColor: '#ffffff', color: '#1e9389', border: '1px solid #1e9389', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }
const hr = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const planBox = { backgroundColor: '#f6f8f9', borderRadius: '14px', padding: '18px 20px', margin: '0 0 14px' }
const planBoxPro = { backgroundColor: '#f0fbf9', border: '1.5px solid #1e9389', borderRadius: '14px', padding: '18px 20px', margin: '0 0 20px' }
const planLabel = { fontSize: '11px', fontWeight: 'bold' as const, color: '#8a9296', letterSpacing: '0.08em', margin: '0 0 6px' }
const planLabelPro = { fontSize: '11px', fontWeight: 'bold' as const, color: '#1e9389', letterSpacing: '0.08em', margin: '0 0 6px' }
const planPrice = { fontSize: '20px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 8px' }
const oldPrice = { fontSize: '13px', fontWeight: 'normal' as const, color: '#8a9296', textDecoration: 'line-through', marginLeft: '4px' }
const perMonth = { fontSize: '13px', fontWeight: 'normal' as const, color: '#8a9296' }
const planDetail = { fontSize: '13px', color: '#3f4548', lineHeight: '1.7', margin: '0' }
