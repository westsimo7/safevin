/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcome } from './welcome.tsx'
import { template as planUpgrade } from './plan-upgrade.tsx'
import { template as chatReply } from './chat-reply.tsx'
import { template as freeLimitReached } from './free-limit-reached.tsx'
import { template as freeReminder2h } from './free-reminder-2h.tsx'
import { template as freeReminder24h } from './free-reminder-24h.tsx'
import { template as freeReminder48h } from './free-reminder-48h.tsx'
import { template as freeReminder4d } from './free-reminder-4d.tsx'
import { template as freeReminder7d } from './free-reminder-7d.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'plan-upgrade': planUpgrade,
  'chat-reply': chatReply,
  'free-limit-reached': freeLimitReached,
  'free-reminder-2h': freeReminder2h,
  'free-reminder-24h': freeReminder24h,
  'free-reminder-48h': freeReminder48h,
  'free-reminder-4d': freeReminder4d,
  'free-reminder-7d': freeReminder7d,
}
