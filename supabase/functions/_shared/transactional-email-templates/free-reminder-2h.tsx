/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, SITE_URL, BundleBlock, PricingCTA, Divider } from './_blocks.tsx'

interface Props { name?: string }

const FreeReminder2hEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Non hai ancora usato il tuo annuncio prova gratuito</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, il tuo annuncio prova ti aspetta` : 'Il tuo annuncio prova ti aspetta'}
        </Heading>
        <Text style={text}>
          Hai creato un account su {SITE_NAME} ma non hai ancora usato il tuo
          annuncio prova gratuito. Bastano pochi minuti: carica le foto e
          {' '}{SITE_NAME} genera titolo, descrizione e prezzo strategico per
          venderlo più velocemente su Vinted.
        </Text>
        <Button style={button} href={`${SITE_URL}/engine/studio`}>
          Usa il mio annuncio prova
        </Button>

        <Divider />
        <Text style={subTitle}>Vuoi più annunci senza abbonamento?</Text>
        <BundleBlock />
        <PricingCTA label="Vai al listino prezzi" />

        <Text style={footer}>
          Hai bisogno di aiuto? Rispondi a questa email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeReminder2hEmail,
  subject: 'Il tuo annuncio prova gratuito ti aspetta',
  displayName: 'Reminder prova 2h',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const subTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 24px' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#8a9296', margin: '32px 0 0' }
