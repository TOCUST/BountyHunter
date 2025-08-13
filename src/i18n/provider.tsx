'use client'
import { NextIntlClientProvider } from 'next-intl'
import ko from '@/messages/ko.json'

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <NextIntlClientProvider locale="ko" messages={ko}>{children}</NextIntlClientProvider>
}


