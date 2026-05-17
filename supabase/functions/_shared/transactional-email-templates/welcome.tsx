/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_URL } from './_blocks.tsx'

interface WelcomeEmailProps { name?: string }

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>🎁 Il tuo primo annuncio è gratis — riscattalo ora.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Ciao {name || 'venditore'},</Heading>

        <Text style={text}>Benvenuto su SAFEViN.</Text>

        <Text style={text}>
          Hai appena fatto la cosa più intelligente che un venditore Vinted
          potesse fare: smettere di perdere tempo a scrivere annunci a mano.
        </Text>

        <Text style={text}>
          Per farti toccare con mano quanto è diverso, ti abbiamo riservato
          un annuncio completamente gratuito.
        </Text>

        <Text style={text}>
          Non si attiva da solo — è tuo, ma devi andartelo a prendere.
        </Text>

        <Button style={button} href={`${SITE_URL}/dashboard/redeem`}>
          Riscatta il tuo annuncio gratuito
        </Button>

        <Text style={text}>
          Ci vogliono 30 secondi. Carichi il tuo articolo, SAFEViN genera il
          titolo, la descrizione e i tag ottimizzati. Copi, incolli, vendi.
        </Text>

        <Text style={text}>
          Nessuna carta di credito. Nessun impegno. Solo un annuncio fatto
          bene — gratis.
        </Text>

        <Text style={footer}>— Il team di SAFEViN</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: '🎁 Il tuo primo annuncio è gratis — riscattalo ora.',
  displayName: 'Benvenuto',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 18px' }
const button = { backgroundColor: '#1e9389', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 24px', textDecoration: 'none', margin: '8px 0 22px', display: 'inline-block' }
const footer = { fontSize: '13px', color: '#8a9296', margin: '24px 0 0' }
