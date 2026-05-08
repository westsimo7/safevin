/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, BundleBlock, PricingCTA, Divider } from './_blocks.tsx'

interface Props { name?: string }

// 7 giorni dopo: spinge tantissimo sulla SAFEViN Artist Direction (servizio premium)
// e in coda mostra solo gli acquisti singoli. NIENTE piani mensili in questa email.
const FreeReminder7dEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Lascia fare a noi: il team SAFEViN Artist Direction crea i tuoi annunci al posto tuo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, lascia fare a noi` : 'Lascia fare a noi'}
        </Heading>
        <Text style={text}>
          Sono passati 7 giorni e i tuoi capi sono ancora fermi. C'è un modo
          più veloce: <strong>delega tutto al team SAFEViN Artist Direction</strong>.
          Carichi le foto, noi creiamo per te titolo, descrizione e prezzo
          strategico ottimizzati per Vinted — pronti da pubblicare.
        </Text>

        <Section style={artistBox}>
          <Text style={artistLabel}>SAFEViN ARTIST DIRECTION · Servizio premium</Text>
          <Text style={artistTitle}>I tuoi annunci, scritti dal nostro team</Text>
          <Text style={artistDetail}>
            • Foto in entrata, annuncio professionale in uscita<br />
            • Titolo, descrizione e prezzo curati uno per uno<br />
            • Prezzo strategico calibrato sul mercato Vinted reale<br />
            • Tempo medio di consegna: poche ore<br />
            • Ideale se hai poco tempo o vendi capi di valore
          </Text>
        </Section>

        <PricingCTA label="Voglio l'Artist Direction" />

        <Divider />
        <Text style={subTitle}>Preferisci fare da solo?</Text>
        <Text style={text}>
          Compra solo gli annunci che ti servono, con sconto fino al -20%
          applicato in automatico.
        </Text>

        <BundleBlock emphasis />

        <PricingCTA label="Vai al listino prezzi" />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeReminder7dEmail,
  subject: 'Lascia fare a noi — Artist Direction crea i tuoi annunci',
  displayName: 'Reminder Artist Direction 7 giorni',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const subTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 22px' }

const artistBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #d97706',
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '0 0 18px',
}
const artistLabel = {
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#b45309',
  letterSpacing: '0.08em',
  margin: '0 0 8px',
}
const artistTitle = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  fontFamily: 'Poppins, Arial, sans-serif',
  margin: '0 0 10px',
}
const artistDetail = {
  fontSize: '13px',
  color: '#3f4548',
  lineHeight: '1.7',
  margin: '0',
}
