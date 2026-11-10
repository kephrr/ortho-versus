import type { Metadata } from 'next'
import { PreviewClient } from '@/components/preview/PreviewClient'
import { isPreviewScreen, type PreviewScreen } from '@/components/preview/screens'

export const metadata: Metadata = {
  title: 'Aperçu du design — Ortho Versus',
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string; bare?: string }>
}) {
  const params = await searchParams
  const initialScreen: PreviewScreen = isPreviewScreen(params.screen) ? params.screen : 'join'

  return <PreviewClient initialScreen={initialScreen} bare={params.bare === '1'} />
}
