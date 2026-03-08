import { NextResponse } from 'next/server'
import type { InboxEntry } from '@/types/inbox'

type ClassifiedAs = NonNullable<InboxEntry['classifiedAs']>

interface ClassifyResult {
  classifiedAs: ClassifiedAs
  tags: string[]
  reasoning: string
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'ANTHROPIC_API_KEY no configurada en el servidor' },
      { status: 400 }
    )
  }

  const { content } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ ok: false, error: 'Contenido vacío' }, { status: 400 })
  }

  const prompt = `Sos un asistente de product management. Analizá esta entrada y clasificala.

ENTRADA: "${content}"

Respondé SOLO con JSON válido, sin texto adicional ni markdown:
{
  "classifiedAs": "feature" | "bug" | "improvement" | "question" | "decision",
  "tags": ["tag1", "tag2"],
  "reasoning": "una frase corta explicando la clasificación"
}

Criterios:
- feature: nueva funcionalidad solicitada o propuesta
- bug: problema, error o comportamiento inesperado
- improvement: mejora a algo ya existente
- question: duda o interrogante que necesita respuesta
- decision: una decisión tomada o a tomar

Los tags deben ser 1-3 palabras en español, relevantes al dominio del producto. Máximo 3 tags.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json(
        { ok: false, error: err.error?.message || 'Error en la API de IA' },
        { status: 500 }
      )
    }

    const data = await res.json()
    const text = data.content?.[0]?.text || ''

    let parsed: ClassifyResult
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ ok: false, error: 'Respuesta de IA inválida' }, { status: 500 })
    }

    const validTypes: ClassifiedAs[] = ['feature', 'bug', 'improvement', 'question', 'decision']
    if (!validTypes.includes(parsed.classifiedAs)) {
      parsed.classifiedAs = 'feature'
    }

    return NextResponse.json({
      ok: true,
      classifiedAs: parsed.classifiedAs,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
      reasoning: parsed.reasoning || '',
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
