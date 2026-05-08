/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, BundleBlock, PlanProBlock, PlanExpertBlock, PricingCTA, Divider } from './_blocks.tsx'

interface Props { name?: string }

// 4 giorni dopo: ricorda crediti esauriti, spinge sugli ACQUISTI SINGOLI con sconti.
// In coda mostra i 2 piani Pro ed Expert.
const FreeReminder4dEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>I tuoi crediti sono esauriti — sblocca subito sconti fino al -20% sugli annunci singoli</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, i tuoi crediti sono ancora a zero` : 'I tuoi crediti sono ancora a zero'}
        </Heading>
        <Text style={text}>
          Sono passati 4 giorni dal tuo ultimo annuncio e le tue prossime
          vendite stanno aspettando. Su {SITE_NAME} non sei costretto a un
          abbonamento: <strong>compra solo gli annunci che ti servono</strong>{' '}
          e blocca subito uno sconto fino al <strong>-20%</strong>.
        </Text>

        <BundleBlock emphasis />

        <Text style={text}>
          Lo sconto si applica in automatico al carrello — niente coupon, niente
          codici da copiare. Più annunci aggiungi, più scendi di prezzo.
        </Text>

        <PricingCTA label="Sblocca i miei sconti" />

        <Divider />
        <Text style={subTitle}>Vendi spesso? Conviene un piano</Text>

        <PlanProBlock />
        <PlanExpertBlock />

        <PricingCTA label="Vai al listino prezzi" />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FreeReminder4dEmail,
  subject: 'Crediti esauriti — sconti fino al -20% sugli annunci singoli',
  displayName: 'Reminder crediti esauriti 4 giorni',
  previewData: { name: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const subTitle = { fontSize: '17px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 22px' }
