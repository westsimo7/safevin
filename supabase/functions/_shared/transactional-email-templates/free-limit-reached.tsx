/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'SAFEViN'
const SITE_URL = 'https://www.safevinengine.com'

interface FreeLimitReachedProps {
  name?: string
}

const FreeLimitReachedEmail = ({ name }: FreeLimitReachedProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Hai finito il tuo annuncio prova gratuito — sblocca di più con i piani in offerta</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, hai usato il tuo annuncio prova gratuito` : 'Hai usato il tuo annuncio prova gratuito'}
        </Heading>
        <Text style={text}>
          Il tuo annuncio prova su {SITE_NAME} è terminato. Per continuare a
          creare annunci professionali e vendere più velocemente su Vinted,
          scegli uno dei piani in offerta lancio.
        </Text>

        <Section style={planBox}>
          <Text style={planLabel}>STARTER · Offerta lancio</Text>
          <Text style={planPrice}>
            5,99€ <span style={oldPrice}>8,99€</span> <span style={perMonth}>/ mese</span>
          </Text>
          <Text style={planDetail}>
            • 10 annunci/mese<br />
            • Salvataggio bozze illimitato<br />
            • Supporto entro 24h
          </Text>
        </Section>

        <Section style={planBoxPro}>
          <Text style={planLabelPro}>PRO · Più scelto</Text>
          <Text style={planPrice}>
            12,99€ <span style={oldPrice}>15,99€</span> <span style={perMonth}>/ mese</span>
          </Text>
          <Text style={planDetail}>
            • 25 annunci/mese<br />
            • Artist Director (revisione professionale)<br />
            • Storico mensile completo<br />
            • Salvataggio bozze + Supporto 24h
          </Text>
        </Section>

        <Button style={button} href={`${SITE_URL}/pricing`}>
          Scopri tutti i piani
        </Button>

        <Hr style={hr} />
        <Text style={footer}>
          Continuerai ad avere accesso al tuo storico e al Coach. I nuovi
          annunci si sbloccano automaticamente attivando un piano.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeLimitReachedEmail,
  subject: 'Hai finito il tuo annuncio prova su SAFEViN',
  displayName: 'Annuncio prova esaurito (Free)',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  fontFamily: 'Poppins, Arial, sans-serif',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#3f4548',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const planBox = {
  border: '1px solid #e3e6e8',
  borderRadius: '14px',
  padding: '16px 18px',
  margin: '0 0 14px',
  backgroundColor: '#fafbfb',
}
const planBoxPro = {
  border: '1.5px solid #1e9389',
  borderRadius: '14px',
  padding: '16px 18px',
  margin: '0 0 22px',
  backgroundColor: '#f1faf9',
}
const planLabel = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#8a9296',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const planLabelPro = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#1e9389',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const planPrice = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  margin: '0 0 8px',
}
const oldPrice = {
  fontSize: '14px',
  color: '#8a9296',
  textDecoration: 'line-through',
  fontWeight: 'normal' as const,
  marginLeft: '4px',
}
const perMonth = {
  fontSize: '13px',
  color: '#8a9296',
  fontWeight: 'normal' as const,
}
const planDetail = {
  fontSize: '13px',
  color: '#3f4548',
  lineHeight: '1.7',
  margin: '0',
}
const button = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e3e6e8', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#8a9296', margin: '0' }
