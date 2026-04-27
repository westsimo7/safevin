/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo codice di verifica</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Conferma la tua identità</Heading>
        <Text style={text}>Inserisci il codice qui sotto per continuare:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Il codice scadrà a breve. Se non hai effettuato questa richiesta,
          puoi ignorare questa email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
  margin: '0 0 24px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1e9389',
  letterSpacing: '4px',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#8a9296', margin: '32px 0 0' }
