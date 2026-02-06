import React, { useId, useState, useRef, useLayoutEffect, useCallback } from 'react'
import './Popover.css'

const ARROW_WIDTH = 48
const ARROW_HEIGHT = 12
const RADIUS = 24
const MIN_BODY = 100 // minimum body width & height

// Exact arrow curve segments from Figma SVG (Path/arrow.svg).
const ARROW_SEGMENTS_RTL = [
  { cp1: [44.2537, 0], cp2: [43, 0.01], to: [43, 0.01] },
  { cp1: [41.7463, 0.02], cp2: [39.2064, 0.051], to: [37.5774, 0.6066] },
  { cp1: [35.8178, 1.2066], cp2: [34.6528, 2.2558], to: [33.4808, 3.4906] },
  { cp1: [32.6369, 4.3787], cp2: [30.9794, 6.2736], to: [30.1723, 7.1884] },
  { cp1: [29.5117, 7.9385], cp2: [28.2187, 9.4212], to: [27.5127, 10.1385] },
  { cp1: [26.6239, 11.0409], cp2: [25.5253, 12], to: [23.9995, 12] },
  { cp1: [22.4736, 12], cp2: [21.3756, 11.0409], to: [20.4873, 10.1394] },
  { cp1: [19.7813, 9.4225], cp2: [18.4883, 7.939], to: [17.8272, 7.1894] },
  { cp1: [17.0211, 6.2745], cp2: [15.3636, 4.3796], to: [14.5192, 3.4915] },
  { cp1: [13.3451, 2.2568], cp2: [12.1822, 1.2076], to: [10.4231, 0.6075] },
  { cp1: [8.7936, 0.0536], cp2: [6.9196, 0.0267], to: [5.2468, 0.0101] },
  { cp1: [3.4973, -0.007], cp2: [1.7489, 0.0028], to: [0, 0.0028] },
]

export default function Popover({
  placement = 'top',
  arrowAlign = 'center',
  children,
  width,
  height,
  theme = 'light',
  style,
  className = '',
}) {
  const id = useId()
  const filterId = `pf-${id}`
  const clipId = `pc-${id}`
  const contentRef = useRef(null)

  // Auto-size: if width/height not provided, measure from content
  const isAutoWidth = width == null
  const isAutoHeight = height == null

  const [measured, setMeasured] = useState({ w: 0, h: 0 })

  const measure = useCallback(() => {
    if (!contentRef.current) return
    if (!isAutoWidth && !isAutoHeight) return
    const el = contentRef.current
    const w = isAutoWidth ? Math.max(Math.ceil(el.scrollWidth), MIN_BODY) : width
    const h = isAutoHeight ? Math.max(Math.ceil(el.scrollHeight), MIN_BODY) : height
    setMeasured((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
  }, [isAutoWidth, isAutoHeight, width, height])

  useLayoutEffect(() => {
    measure()
    if (!isAutoWidth && !isAutoHeight) return

    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, isAutoWidth, isAutoHeight])

  const bodyW = Math.max(isAutoWidth ? measured.w : width, MIN_BODY)
  const bodyH = Math.max(isAutoHeight ? measured.h : height, MIN_BODY)

  // Don't render shape until we have a measurement
  if ((isAutoWidth || isAutoHeight) && bodyW === 0 && bodyH === 0) {
    return (
      <div className={`popover-wrapper ${className}`} style={style}>
        <div ref={contentRef} className="popover-measure">
          {children}
        </div>
      </div>
    )
  }

  const svgWidth = placement === 'left' || placement === 'right' ? bodyW + ARROW_HEIGHT : bodyW
  const svgHeight = placement === 'top' || placement === 'bottom' ? bodyH + ARROW_HEIGHT : bodyH

  const path = buildPath(bodyW, bodyH, RADIUS, ARROW_WIDTH, ARROW_HEIGHT, placement, arrowAlign)

  const isDark = theme === 'dark'
  const bgFill = isDark ? 'rgba(43,47,51,0.7)' : 'rgba(250,251,252,0.7)'

  const shadow1 = isDark
    ? { dy: 8, std: 12, color: 'rgba(0,0,0,0.20)' }
    : { dy: 6, std: 10, color: 'rgba(0,0,0,0.06)' }
  const shadow2 = isDark
    ? { dy: 0, std: 4, color: 'rgba(0,0,0,0.08)' }
    : { dy: 0, std: 2, color: 'rgba(0,0,0,0.04)' }

  const strokeColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'

  const contentStyle = getContentStyle(bodyW, bodyH, placement)
  // For auto-size, content needs to be able to determine its own size
  const autoContentStyle = {
    ...contentStyle,
    ...(isAutoWidth ? { width: 'auto' } : {}),
    ...(isAutoHeight ? { height: 'auto' } : {}),
  }

  return (
    <div
      className={`popover-wrapper ${className}`}
      style={{ width: svgWidth, height: svgHeight, ...style }}
    >
      {/* Backdrop blur — before SVG so it doesn't sample the shadow */}
      <div
        className="popover-blur"
        style={{
          clipPath: `path('${path}')`,
          WebkitClipPath: `path('${path}')`,
        }}
      />

      {/* Unified shape SVG */}
      <svg
        className="popover-svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy={shadow2.dy} stdDeviation={shadow2.std} floodColor={shadow2.color} />
            <feDropShadow dx="0" dy={shadow1.dy} stdDeviation={shadow1.std} floodColor={shadow1.color} />
          </filter>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill={bgFill} filter={`url(#${filterId})`} />
        <g clipPath={`url(#${clipId})`}>
          <path d={path} fill="none" stroke={strokeColor} strokeWidth="2" />
        </g>
      </svg>

      {/* Content */}
      <div ref={contentRef} className="popover-content" style={autoContentStyle}>
        {children}
      </div>
    </div>
  )
}

function getContentStyle(width, height, placement) {
  const base = { width, height, position: 'absolute' }
  switch (placement) {
    case 'top':    return { ...base, left: 0, bottom: 0 }
    case 'bottom': return { ...base, left: 0, top: 0 }
    case 'left':   return { ...base, right: 0, top: 0 }
    case 'right':  return { ...base, left: 0, top: 0 }
    default:       return { ...base, left: 0, bottom: 0 }
  }
}

// ── Path building ──────────────────────────────────────────

function buildPath(w, h, r, arrowW, arrowH, placement, arrowAlign) {
  // Clamp radius if body is too small
  const rr = Math.min(r, w / 2, h / 2)

  let bx = 0, by = 0
  switch (placement) {
    case 'top':    by = arrowH; break
    case 'bottom': by = 0; break
    case 'left':   bx = arrowH; break
    case 'right':  bx = 0; break
  }
  const arrowCenter = getArrowCenter(w, h, rr, arrowW, placement, arrowAlign, bx, by)
  return buildMergedPath(bx, by, w, h, rr, placement, arrowCenter)
}

function getArrowCenter(w, h, r, arrowW, placement, align, bx, by) {
  if (placement === 'top' || placement === 'bottom') {
    const center = bx + w / 2
    return align === 'start' ? bx + r + arrowW / 2
         : align === 'end'   ? bx + w - r - arrowW / 2
         : center
  }
  const center = by + h / 2
  return align === 'start' ? by + r + arrowW / 2
       : align === 'end'   ? by + h - r - arrowW / 2
       : center
}

function transformArrowPoint(x, y, placement, arrowCenter, bx, by, w, h) {
  const cx = x - 24
  const cy = y
  switch (placement) {
    case 'top':    return [arrowCenter + cx, by - cy]
    case 'bottom': return [arrowCenter + cx, by + h + cy]
    case 'left':   return [bx - cy, arrowCenter + cx]
    case 'right':  return [bx + w + cy, arrowCenter + cx]
    default:       return [arrowCenter + cx, by - cy]
  }
}

function buildMergedPath(bx, by, w, h, r, placement, arrowCenter) {
  const right = bx + w
  const bottom = by + h
  const tx = (x, y) => transformArrowPoint(x, y, placement, arrowCenter, bx, by, w, h)

  const allPoints = [{ x: 48, y: 0.0019 }]
  for (const seg of ARROW_SEGMENTS_RTL) {
    allPoints.push({ x: seg.to[0], y: seg.to[1] })
  }

  function arrowLTR() {
    let d = ''
    for (let i = ARROW_SEGMENTS_RTL.length - 1; i >= 0; i--) {
      const seg = ARROW_SEGMENTS_RTL[i]
      const [cp2x, cp2y] = tx(seg.cp2[0], seg.cp2[1])
      const [cp1x, cp1y] = tx(seg.cp1[0], seg.cp1[1])
      const [ex, ey] = tx(allPoints[i].x, allPoints[i].y)
      d += ` C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${ex} ${ey}`
    }
    return d
  }

  function arrowRTL() {
    let d = ''
    for (const seg of ARROW_SEGMENTS_RTL) {
      const [cp1x, cp1y] = tx(seg.cp1[0], seg.cp1[1])
      const [cp2x, cp2y] = tx(seg.cp2[0], seg.cp2[1])
      const [ex, ey] = tx(seg.to[0], seg.to[1])
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`
    }
    return d
  }

  let d = `M ${bx + r} ${by}`

  if (placement === 'top') {
    const [sx, sy] = tx(0, 0.0028)
    d += ` L ${sx} ${sy}`
    d += arrowLTR()
  }
  d += ` L ${right - r} ${by}`
  d += ` Q ${right} ${by} ${right} ${by + r}`

  if (placement === 'right') {
    const [sx, sy] = tx(0, 0.0028)
    d += ` L ${sx} ${sy}`
    d += arrowLTR()
  }
  d += ` L ${right} ${bottom - r}`
  d += ` Q ${right} ${bottom} ${right - r} ${bottom}`

  if (placement === 'bottom') {
    const [sx, sy] = tx(48, 0.0019)
    d += ` L ${sx} ${sy}`
    d += arrowRTL()
  }
  d += ` L ${bx + r} ${bottom}`
  d += ` Q ${bx} ${bottom} ${bx} ${bottom - r}`

  if (placement === 'left') {
    const [sx, sy] = tx(48, 0.0019)
    d += ` L ${sx} ${sy}`
    d += arrowRTL()
  }
  d += ` L ${bx} ${by + r}`
  d += ` Q ${bx} ${by} ${bx + r} ${by}`

  d += ' Z'
  return d
}
