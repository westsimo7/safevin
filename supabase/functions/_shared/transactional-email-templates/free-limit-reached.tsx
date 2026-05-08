/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { SITE_NAME, BundleBlock, PlanProBlock, PlanExpertBlock, PricingCTA, Divider } from './_blocks.tsx'

interface Props { name?: string }

const FreeLimitReachedEmail = ({ name }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Hai finito il tuo annuncio prova — sblocca di più con i piani o gli acquisti singoli</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `${name}, hai usato il tuo annuncio prova` : 'Hai usato il tuo annuncio prova'}
        </Heading>
        <Text style={text}>
          Il tuo annuncio prova su {SITE_NAME} è terminato. Per continuare a
          creare annunci professionali e vendere più velocemente su Vinted,
          scegli un piano oppure compra solo gli annunci che ti servono.
        </Text>

        <BundleBlock />
        <PlanProBlock />
        <PlanExpertBlock />

        <PricingCTA />

        <Divider />
        <Text style={footer}>
          Continuerai ad avere accesso al tuo storico e al Coach. I nuovi
          annunci si sbloccano automaticamente dal listino prezzi.
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
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0f1719', fontFamily: 'Poppins, Arial, sans-serif', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#3f4548', lineHeight: '1.6', margin: '0 0 22px' }
const footer = { fontSize: '12px', color: '#8a9296', margin: '0' }
