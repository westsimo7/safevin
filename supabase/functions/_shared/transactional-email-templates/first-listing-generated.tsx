/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const BUNDLE_URL = `${SITE_URL}/pricing#bundle`
const PLANS_URL = `${SITE_URL}/pricing`

const FirstListingEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo primo annuncio SAFEViN è pronto ⚡</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, il tuo primo annuncio SAFEViN è pronto ⚡` : 'Il tuo primo annuncio SAFEViN è pronto ⚡'}
        </Heading>

        <Text style={text}>Hai appena visto come si vende davvero su Vinted.</Text>
        <Text style={text}>
          In pochi secondi hai creato un annuncio professionale che gli altri impiegano minuti
          a scrivere — e spesso lo scrivono male.
        </Text>
        <Text style={text}>
          Quella roba che hai appena fatto? La fanno i venditori che vendono ogni giorno.
        </Text>

        <Text style={textBold}>Adesso hai due scelte:</Text>
        <Text style={text}>
          1. Torni a scrivere annunci a mano, uno per uno, sperando che qualcuno li legga.<br />
          2. Oppure continui così — veloce, professionale, con prezzi che convincono davvero.
        </Text>

        <Text style={text}>Inizia con quello che ti serve, senza impegno:</Text>

        {/* BUNDLE BOX */}
        <Section style={bundleBox}>
          <Text style={bundleLabel}>ANNUNCI SINGOLI · Senza abbonamento</Text>
          <Text style={bundleDetail}>Scegli il pacchetto: paghi una volta sola.</Text>
          <Text style={bundleList}>
            → <strong>5 ANNUNCI</strong> · <strong>2,95€</strong><br />
            → ⭐ <strong>10 ANNUNCI</strong> · <strong>5,95€</strong> <span style={discountBest}>il più scelto</span><br />
            → <strong>15 ANNUNCI</strong> · <strong>9,95€</strong>
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '14px' }}>
            <Button style={ctaPrimary} href={BUNDLE_URL}>Compra adesso →</Button>
          </Section>
        </Section>

        <Text style={text}>Oppure se vuoi andare forte ogni mese:</Text>

        {/* PLANS */}
        <Section style={planRow}>
          <Text style={planLine}>
            <strong style={planNameStarter}>STARTER</strong> · 5,99€/mese — 10 annunci
          </Text>
          <Text style={planLine}>
            <strong style={planNamePro}>PRO</strong> · 12,99€/mese — 25 annunci + Artist Direction
          </Text>
          <Text style={planLine}>
            <strong style={planNameExpert}>EXPERT</strong> · 34,99€/mese — 60 annunci + tutto incluso
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '14px' }}>
            <Button style={ctaSecondary} href={PLANS_URL}>Scopri i piani →</Button>
          </Section>
        </Section>

        <Hr style={hr} />
        <Text style={launchNote}>
          ⚡ Offerta lancio disponibile per poco. I prezzi aumenteranno presto.
        </Text>
        <Text style={footer}>
          {SITE_NAME} — l'Engine che fa vendere chi vende davvero su Vinted.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FirstListingEmail,
  subject: 'Il tuo primo annuncio SAFEViN è pronto ⚡',
  displayName: 'Post primo annuncio (Free)',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '580px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 22px', lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.65', margin: '0 0 14px' }
const textBold = { fontSize: '15px', color: '#0f1719', fontWeight: 'bold' as const, margin: '18px 0 8px' }

const bundleBox = {
  backgroundColor: '#fff8f1',
  border: '2px solid #f97316',
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '18px 0',
}
const bundleLabel = { fontSize: '12px', fontWeight: 'bold' as const, color: '#c2410c', letterSpacing: '0.08em', margin: '0 0 8px' }
const bundlePrice = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 4px' }
const perItem = { fontSize: '14px', fontWeight: 'normal' as const, color: '#8a9296' }
const bundleDetail = { fontSize: '13px', color: '#3f4548', margin: '0 0 10px' }
const bundleList = { fontSize: '14px', color: '#0f1719', lineHeight: '1.9', margin: '0' }
const discount = { color: '#c2410c', fontWeight: 'bold' as const, fontSize: '13px' }
const discountBest = { color: '#16a34a', fontWeight: 'bold' as const, fontSize: '13px' }

const planRow = {
  backgroundColor: '#f0fbf9',
  border: '1.5px solid #1e9389',
  borderRadius: '14px',
  padding: '18px 22px',
  margin: '8px 0 18px',
}
const planLine = { fontSize: '14px', color: '#0f1719', lineHeight: '1.7', margin: '0 0 6px' }
const planNameStarter = { color: '#3f4548' }
const planNamePro = { color: '#1e9389' }
const planNameExpert = { color: '#b45309' }

const ctaPrimary = {
  backgroundColor: '#f97316',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 26px',
  textDecoration: 'none',
}
const ctaSecondary = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 26px',
  textDecoration: 'none',
}

const hr = { borderColor: '#e5e7eb', margin: '24px 0 18px' }
const launchNote = { fontSize: '13px', color: '#c2410c', fontWeight: 'bold' as const, margin: '0 0 10px', textAlign: 'center' as const }
const footer = { fontSize: '12px', color: '#8a9296', margin: '0', textAlign: 'center' as const }
