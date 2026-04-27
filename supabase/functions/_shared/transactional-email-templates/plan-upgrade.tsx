/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'SAFEViN'
const SITE_URL = 'https://www.safevinengine.com'

interface PlanUpgradeProps {
  name?: string
  plan?: string
}

const PlanUpgradeEmail = ({ name, plan }: PlanUpgradeProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo piano {SITE_NAME} è attivo</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Grazie ${name}!` : 'Grazie!'}
        </Heading>
        <Text style={text}>
          Il tuo piano <strong>{plan ?? 'premium'}</strong> su {SITE_NAME} è
          ora attivo. Hai sbloccato nuovi limiti e funzionalità per
          velocizzare le tue vendite su Vinted.
        </Text>
        <Button style={button} href={`${SITE_URL}/dashboard`}>
          Vai alla dashboard
        </Button>
        <Text style={footer}>
          Per modificare o gestire il tuo piano, vai in Impostazioni →
          Metodi di pagamento.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PlanUpgradeEmail,
  subject: (data: Record<string, any>) =>
    `Piano ${data?.plan ?? 'premium'} attivo su ${SITE_NAME}`,
  displayName: 'Conferma upgrade piano',
  previewData: { name: 'Marco', plan: 'Pro' },
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
const button = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#8a9296', margin: '32px 0 0' }
