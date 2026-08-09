import type {
  DefaultNodeTypes,
  SerializedBlockNode
} from '@payloadcms/richtext-lexical'
import {
  convertLexicalToHTML,
  type HTMLConvertersFunction
} from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type CodeBlockFields = {
  blockType: 'code'
  code?: string | null
  language?: string | null
}

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<CodeBlockFields>

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeLanguage(language: unknown): string {
  if (typeof language !== 'string') return 'plaintext'
  const normalized = language.trim().toLowerCase().replace(/[^a-z0-9_+-]/g, '')
  return normalized || 'plaintext'
}

/** Match Aurora theme: `div.language-{lang} > .lang + pre > code`. */
const htmlConverters: HTMLConvertersFunction<NodeTypes> = ({
  defaultConverters
}) => ({
  ...defaultConverters,
  blocks: {
    ...defaultConverters.blocks,
    code: ({ node }) => {
      const code = typeof node.fields.code === 'string' ? node.fields.code : ''
      const language = sanitizeLanguage(node.fields.language)
      const escaped = escapeHtml(code)

      return `<div class="language-${language}"><span class="lang">${escapeHtml(language)}</span><pre><code class="language-${language}">${escaped}</code></pre></div>`
    }
  }
})

export function lexicalToHtml(
  data: SerializedEditorState | null | undefined
): string {
  if (!data) return ''
  return convertLexicalToHTML({
    converters: htmlConverters,
    data
  })
}
