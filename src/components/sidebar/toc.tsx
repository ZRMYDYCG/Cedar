export default function Toc({ html }: { html?: string }) {
  if (!html) {
    return (
      <div className="sidebar-box text-sm text-ob-dim">
        Table of contents will appear here.
      </div>
    )
  }
  return (
    <div
      className="sidebar-box toc prose prose-invert text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
