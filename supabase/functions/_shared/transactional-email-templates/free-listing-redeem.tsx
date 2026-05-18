/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, SITE_URL } from './_blocks.tsx'

interface Props { name?: string }

const STUDIO_URL = `${SITE_URL}/engine-studio`

const FreeListingRedeemEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo annuncio gratis ti aspetta su {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Ciao ${name}, hai fatto bene a riscattarlo.` : 'Ciao, hai fatto bene a riscattarlo.'}
        </Heading>

        <Text style={text}>
          Clicca qui sotto e crea il tuo primo annuncio {SITE_NAME} adesso — ci vogliono meno di 3 minuti.
        </Text>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button style={ctaPrimary} href={STUDIO_URL}>
            → Riscatta il tuo annuncio gratis
          </Button>
        </Section>

        <Text style={textSmall}>
          Carica la foto, rispondi a 2 domande, copia e pubblica su Vinted. Fatto.
        </Text>

        <Hr style={hr} />

        <Text style={textSmall}>
          Se hai dubbi o vuoi un consiglio su come usarlo al meglio, rispondi a questa email.
        </Text>

        <Text style={footer}>
          — Team {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeListingRedeemEmail,
  subject: 'Il tuo annuncio gratis ti aspetta ✦',
  displayName: 'Riscatto annuncio gratis',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '580px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px', lineHeight: '1.35' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.65', margin: '0 0 14px' }
const textSmall = { fontSize: '14px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 12px' }
const ctaPrimary = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 26px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e5e7eb', margin: '22px 0 18px' }
const footer = { fontSize: '13px', color: '#8a9296', margin: '16px 0 0', fontStyle: 'italic' as const }
