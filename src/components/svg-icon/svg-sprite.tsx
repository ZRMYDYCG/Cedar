import { SVG_SPRITE } from './svg-sprite-data'

/** Injects the icon sprite once. */
export default function SvgSprite() {
  return (
    <div
      id="__svg__icons__dom__"
      dangerouslySetInnerHTML={{ __html: SVG_SPRITE }}
      aria-hidden
    />
  )
}
