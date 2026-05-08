/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, SITE_URL, BundleBlock, Divider, PricingCTA } from './_blocks.tsx'

interface WelcomeEmailProps { name?: string }

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Benvenuto su {SITE_NAME} — vendi più velocemente su Vinted</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Benvenuto, ${name}!` : `Benvenuto su ${SITE_NAME}!`}
        </Heading>
        <Text style={text}>
          Sei dentro. {SITE_NAME} ti aiuta a creare annunci Vinted ottimizzati
          per la conversione: titolo, descrizione e prezzo strategico in pochi
          minuti.
        </Text>
        <Text style={text}>
          Inizia subito caricando le foto del tuo prodotto in Studio.
        </Text>
        <Button style={button} href={`${SITE_URL}/engine/studio`}>
          Crea il primo annuncio
        </Button>

        <Divider />
        <Text style={subTitle}>Quando vorrai più annunci</Text>
        <BundleBlock />
        <PricingCTA />

        <Text style={footer}>
          Hai bisogno di aiuto? Rispondi a questa email o scrivici dal Centro
          Assistenza.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Benvenuto su ${SITE_NAME}`,
  displayName: 'Benvenuto',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const subTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#8a9296', margin: '32px 0 0' }
