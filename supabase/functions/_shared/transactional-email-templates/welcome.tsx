/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface WelcomeEmailProps { name?: string }

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Benvenuto su SAFEViN 👋</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Ciao {name || 'venditore'},</Heading>

        <Text style={text}>Benvenuto su SAFEViN.</Text>

        <Text style={text}>
          Da oggi i tuoi annunci su Vinted non li scrivi più tu.
        </Text>

        <Text style={text}>
          Carichi il tuo articolo, SAFEViN genera titolo, descrizione, prezzo
          strategico, tips di vendita e tag ottimizzati in pochi secondi.
          Copi, incolli, vendi.
        </Text>

        <Text style={text}>
          Scopri la versione <strong>ARTIST DIRECTOR</strong>, affida al nostro
          team la parte visiva dei tuoi annunci rendendoli più attraenti agli
          occhi dei tuoi possibili acquirenti!
        </Text>

        <Text style={highlight}>
          Più professionale. Più visibilità. Più vendite.
        </Text>

        <Text style={text}>
          Quando sei pronto a fare sul serio, scegli la formula che fa per te:
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>Annunci singoli</Heading>
        <Section style={priceBox}>
          <Text style={priceRow}><strong>5 annunci</strong> — €2,95</Text>
          <Text style={priceRow}><strong>10 annunci</strong> — €4,95</Text>
          <Text style={priceRow}><strong>15 annunci</strong> — €8,95</Text>
        </Section>

        <Heading as="h2" style={h2}>Abbonamenti</Heading>
        <Section style={priceBox}>
          <Text style={priceRow}><strong>Pro</strong> — €12,99/mese · 25 annunci + Artist Director</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>— Il team di SAFEViN</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Benvenuto su SAFEViN 👋',
  displayName: 'Benvenuto',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const h2 = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '20px 0 10px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 18px' }
const highlight = { fontSize: '16px', color: '#1e9389', fontWeight: 'bold' as const, lineHeight: '1.5', margin: '0 0 18px' }
const priceBox = { backgroundColor: '#f6f8f9', borderRadius: '12px', padding: '14px 18px', margin: '0 0 12px' }
const priceRow = { fontSize: '14px', color: '#0f1719', lineHeight: '1.6', margin: '4px 0' }
const hr = { borderColor: '#e6e9eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#8a9296', margin: '24px 0 0' }
