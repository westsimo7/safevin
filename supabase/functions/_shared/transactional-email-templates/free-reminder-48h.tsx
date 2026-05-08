/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, SITE_URL, BundleBlock, PlanProBlock, PricingCTA, Divider } from './_blocks.tsx'

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

        <Divider />
        <Text style={subTitle}>Oppure scegli direttamente la tua opzione</Text>

        <BundleBlock />
        <PlanProBlock />

        <PricingCTA />
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
