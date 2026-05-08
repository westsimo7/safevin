/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22'

export const SITE_NAME = 'SAFEViN'
export const SITE_URL = 'https://www.safevinengine.com'
// Tutti i CTA delle email portano alla pagina listino prezzi (Dashboard)
export const PRICING_URL = `${SITE_URL}/pricing`

// ---------- BUNDLE / ACQUISTI SINGOLI ----------
interface BundleBlockProps {
  emphasis?: boolean // se true, evidenziato (per email che spingono sui bundle)
}

export const BundleBlock = ({ emphasis = false }: BundleBlockProps) => (
  <Section style={emphasis ? bundleBoxEmphasis : bundleBox}>
    <Text style={emphasis ? bundleLabelEmphasis : bundleLabel}>
      ACQUISTI SINGOLI · Senza abbonamento
    </Text>
    <Text style={bundlePrice}>
      0,59€ <span style={perItem}>/ annuncio</span>
    </Text>
    <Text style={bundleDetail}>
      Paghi solo gli annunci che ti servono. Più ne compri, più risparmi:
    </Text>
    <Section style={discountRow}>
      <Text style={discountPill}>10 annunci → -10%</Text>
      <Text style={discountPill}>30 annunci → -15%</Text>
      <Text style={discountPillBest}>60 annunci → -20%</Text>
    </Section>
    <Text style={bundleDetail}>
      • Sconto applicato in automatico al checkout<br />
      • Nessun rinnovo · nessun coupon da inserire<br />
      • Include tutto lo Starter (prezzo strategico, Tommy Scendi)
    </Text>
  </Section>
)

// ---------- PIANO PRO ----------
export const PlanProBlock = () => (
  <Section style={planBoxPro}>
    <Text style={planLabelPro}>PRO · Più scelto</Text>
    <Text style={planPrice}>
      12,99€ <span style={oldPrice}>15,99€</span> <span style={perMonth}>/ mese</span>
    </Text>
    <Text style={planDetail}>
      • 25 annunci creabili<br />
      • Prezzo strategico avanzato<br />
      • Accesso alla SAFEViN Artist Direction<br />
      • 2 annunci delegabili al team SAFEViN Artist Direction
    </Text>
  </Section>
)

// ---------- PIANO EXPERT ----------
export const PlanExpertBlock = () => (
  <Section style={planBoxExpert}>
    <Text style={planLabelExpert}>EXPERT · Per chi vende ogni giorno</Text>
    <Text style={planPrice}>
      34,99€ <span style={oldPrice}>39,99€</span> <span style={perMonth}>/ mese</span>
    </Text>
    <Text style={planDetail}>
      • 60 annunci creabili<br />
      • SAFEViN Artist Direction completa<br />
      • 6 annunci delegabili al team Artist Direction<br />
      • Accesso Upgrade & Collaborazioni
    </Text>
  </Section>
)

// ---------- PRIMARY CTA → DASHBOARD LISTINO PREZZI ----------
interface CTAProps { label?: string }
export const PricingCTA = ({ label = 'Vai al listino prezzi' }: CTAProps) => (
  <Button style={ctaButton} href={PRICING_URL}>{label}</Button>
)

export const PricingCTAOutline = ({ label = 'Vedi tutti i piani' }: CTAProps) => (
  <Button style={ctaOutline} href={PRICING_URL}>{label}</Button>
)

export const Divider = () => <Hr style={hr} />

// ---------- STYLES ----------
const bundleBox = {
  backgroundColor: '#fff8f1',
  border: '1.5px solid #f59e0b',
  borderRadius: '14px',
  padding: '18px 20px',
  margin: '0 0 16px',
}
const bundleBoxEmphasis = {
  backgroundColor: '#fff4e5',
  border: '2px solid #f97316',
  borderRadius: '14px',
  padding: '20px 22px',
  margin: '0 0 18px',
}
const bundleLabel = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#b45309',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const bundleLabelEmphasis = {
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#c2410c',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const bundlePrice = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  fontFamily: 'Poppins, Arial, sans-serif',
  margin: '0 0 8px',
}
const perItem = { fontSize: '13px', fontWeight: 'normal' as const, color: '#8a9296' }
const bundleDetail = {
  fontSize: '13px',
  color: '#3f4548',
  lineHeight: '1.7',
  margin: '0 0 10px',
}
const discountRow = { margin: '8px 0 12px', textAlign: 'center' as const }
const discountPill = {
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#c2410c',
  backgroundColor: '#fff1e0',
  border: '1px solid #fdba74',
  borderRadius: '999px',
  padding: '6px 10px',
  margin: '4px 4px',
}
const discountPillBest = {
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  backgroundColor: '#16a34a',
  border: '1px solid #16a34a',
  borderRadius: '999px',
  padding: '6px 10px',
  margin: '4px 4px',
}

const planBoxPro = {
  backgroundColor: '#f0fbf9',
  border: '1.5px solid #1e9389',
  borderRadius: '14px',
  padding: '18px 20px',
  margin: '0 0 14px',
}
const planBoxExpert = {
  backgroundColor: '#fef3c7',
  border: '1.5px solid #d97706',
  borderRadius: '14px',
  padding: '18px 20px',
  margin: '0 0 18px',
}
const planLabelPro = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#1e9389',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const planLabelExpert = {
  fontSize: '11px',
  fontWeight: 'bold' as const,
  color: '#b45309',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
}
const planPrice = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0f1719',
  fontFamily: 'Poppins, Arial, sans-serif',
  margin: '0 0 8px',
}
const oldPrice = {
  fontSize: '13px',
  fontWeight: 'normal' as const,
  color: '#8a9296',
  textDecoration: 'line-through',
  marginLeft: '4px',
}
const perMonth = { fontSize: '13px', fontWeight: 'normal' as const, color: '#8a9296' }
const planDetail = {
  fontSize: '13px',
  color: '#3f4548',
  lineHeight: '1.7',
  margin: '0',
}

const ctaButton = {
  backgroundColor: '#1e9389',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const ctaOutline = {
  backgroundColor: '#ffffff',
  color: '#1e9389',
  border: '1px solid #1e9389',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  marginTop: '12px',
}
const hr = { borderColor: '#e5e7eb', margin: '28px 0 22px' }
