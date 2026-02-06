import React, { useState, useRef, useEffect, useCallback } from 'react'
import Popover from './Popover'
import './App.css'

const PLACEMENTS = ['top', 'bottom', 'left', 'right']
const ARROW_ALIGNS = ['start', 'center', 'end']

export default function App() {
  const [visible, setVisible] = useState(false)
  const [placement, setPlacement] = useState('top')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [theme, setTheme] = useState('light')
  const btnRef = useRef(null)

  const isDark = theme === 'dark'

  const popoverWidth = 200
  const popoverHeight = 120
  const arrowHeight = 12
  const gap = 4

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    let top = 0
    let left = 0

    const totalH = popoverHeight + arrowHeight
    const totalW = popoverWidth + arrowHeight
    switch (placement) {
      case 'top':
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - popoverWidth / 2
        break
      case 'bottom':
        top = rect.top - gap - totalH
        left = rect.left + rect.width / 2 - popoverWidth / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - popoverHeight / 2
        left = rect.right + gap
        break
      case 'right':
        top = rect.top + rect.height / 2 - popoverHeight / 2
        left = rect.left - gap - totalW
        break
    }

    setPosition({ top, left })
  }, [placement])

  useEffect(() => {
    if (visible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [visible, updatePosition])

  const toggle = () => setVisible((v) => !v)

  const cyclePlacement = () => {
    const idx = PLACEMENTS.indexOf(placement)
    setPlacement(PLACEMENTS[(idx + 1) % PLACEMENTS.length])
  }

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  useEffect(() => {
    if (!visible) return
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return
      setVisible(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visible])

  const textColor = isDark ? '#ccc' : '#666'
  const titleColor = isDark ? '#eee' : '#333'
  const subColor = isDark ? '#888' : '#999'

  return (
    <div className={`demo ${isDark ? 'demo-dark' : ''}`}>
      <div className="demo-header">
        <h2 className="demo-title">Popover Component</h2>
        <button className="theme-btn" onClick={toggleTheme}>
          {isDark ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* ── Section 1: Placements ── */}
      <h3 className="section-title" style={{ color: titleColor }}>Placements</h3>
      <div className="demo-grid">
        {PLACEMENTS.map((p) => (
          <div className="demo-item" key={p}>
            <span className="demo-label">{p}</span>
            <Popover placement={p} arrowAlign="center" theme={theme}>
              <span style={{ fontSize: 12, color: textColor }}>Content</span>
            </Popover>
          </div>
        ))}
      </div>

      {/* ── Section 2: Arrow Alignment ── */}
      <h3 className="section-title" style={{ color: titleColor }}>Arrow Alignment</h3>
      <div className="demo-grid">
        {ARROW_ALIGNS.map((align) => (
          <div className="demo-item" key={align}>
            <span className="demo-label">{align}</span>
            <Popover
              placement="top"
              arrowAlign={align}
              theme={theme}
              width={180}
              height={60}
            >
              <span style={{ fontSize: 12, color: textColor }}>align: {align}</span>
            </Popover>
          </div>
        ))}
      </div>

      {/* ── Section 3: Auto-size — different content lengths ── */}
      <h3 className="section-title" style={{ color: titleColor }}>Auto Size (content-driven)</h3>
      <div className="demo-grid">
        {/* Short text */}
        <div className="demo-item">
          <span className="demo-label">short</span>
          <Popover placement="top" theme={theme}>
            <span style={{ fontSize: 12, color: textColor }}>OK</span>
          </Popover>
        </div>

        {/* Medium text */}
        <div className="demo-item">
          <span className="demo-label">medium</span>
          <Popover placement="top" theme={theme}>
            <span style={{ fontSize: 12, color: textColor }}>Hello World</span>
          </Popover>
        </div>

        {/* Longer text */}
        <div className="demo-item">
          <span className="demo-label">long</span>
          <Popover placement="top" theme={theme}>
            <span style={{ fontSize: 12, color: textColor }}>This is a longer piece of text</span>
          </Popover>
        </div>

        {/* Icon + text */}
        <div className="demo-item">
          <span className="demo-label">icon + text</span>
          <Popover placement="top" theme={theme}>
            <span style={{ fontSize: 13, color: textColor }}>✦ Starred</span>
          </Popover>
        </div>
      </div>

      {/* ── Section 4: Fixed sizes ── */}
      <h3 className="section-title" style={{ color: titleColor }}>Fixed Size</h3>
      <div className="demo-grid">
        <div className="demo-item">
          <span className="demo-label">120 × 48</span>
          <Popover placement="top" theme={theme} width={120} height={48}>
            <span style={{ fontSize: 12, color: textColor }}>Small</span>
          </Popover>
        </div>

        <div className="demo-item">
          <span className="demo-label">200 × 80</span>
          <Popover placement="top" theme={theme} width={200} height={80}>
            <span style={{ fontSize: 12, color: textColor }}>Medium</span>
          </Popover>
        </div>

        <div className="demo-item">
          <span className="demo-label">280 × 120</span>
          <Popover placement="top" theme={theme} width={280} height={120}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: titleColor, marginBottom: 4 }}>
                Title
              </div>
              <div style={{ fontSize: 12, color: subColor }}>
                Description text here
              </div>
            </div>
          </Popover>
        </div>
      </div>

      {/* ── Section 5: Multi-line / rich content (auto height) ── */}
      <h3 className="section-title" style={{ color: titleColor }}>Rich Content (auto height)</h3>
      <div className="demo-grid" style={{ alignItems: 'flex-start' }}>
        {/* Single line auto */}
        <div className="demo-item">
          <span className="demo-label">tooltip</span>
          <Popover placement="top" theme={theme}>
            <span style={{ fontSize: 12, color: textColor }}>Tooltip hint</span>
          </Popover>
        </div>

        {/* Multi-line with fixed width */}
        <div className="demo-item">
          <span className="demo-label">multi-line</span>
          <Popover placement="top" theme={theme} width={200}>
            <div style={{ fontSize: 12, color: textColor, lineHeight: 1.5 }}>
              This is a popover with multiple lines of content that wraps naturally.
            </div>
          </Popover>
        </div>

        {/* List content */}
        <div className="demo-item">
          <span className="demo-label">list</span>
          <Popover placement="top" theme={theme} width={160}>
            <div style={{ fontSize: 12, color: textColor, lineHeight: 1.8, textAlign: 'left', width: '100%' }}>
              <div>Copy</div>
              <div>Paste</div>
              <div>Delete</div>
            </div>
          </Popover>
        </div>

        {/* Card style */}
        <div className="demo-item">
          <span className="demo-label">card</span>
          <Popover placement="top" theme={theme} width={220}>
            <div style={{ textAlign: 'left', width: '100%' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: titleColor, marginBottom: 6 }}>
                User Profile
              </div>
              <div style={{ fontSize: 12, color: subColor, marginBottom: 4 }}>
                john@example.com
              </div>
              <div style={{ fontSize: 11, color: subColor, opacity: 0.7 }}>
                Last active 2 hours ago
              </div>
            </div>
          </Popover>
        </div>
      </div>

      {/* ── Section 6: Placement × auto-size combos ── */}
      <h3 className="section-title" style={{ color: titleColor }}>All Placements (auto-sized)</h3>
      <div className="demo-grid">
        {PLACEMENTS.map((p) => (
          <div className="demo-item" key={`auto-${p}`}>
            <span className="demo-label">{p}</span>
            <Popover placement={p} theme={theme} width={180}>
              <div style={{ fontSize: 12, color: textColor, lineHeight: 1.5, textAlign: 'center' }}>
                <div style={{ fontWeight: 500, color: titleColor }}>Heading</div>
                <div>Auto height with placement="{p}"</div>
              </div>
            </Popover>
          </div>
        ))}
      </div>

      {/* ── Interactive demo ── */}
      <div className="demo-interactive">
        <h3 className="section-title" style={{ color: titleColor, marginBottom: 12 }}>Interactive</h3>
        <div className="demo-controls">
          <button className="demo-btn" ref={btnRef} onClick={toggle}>
            Click me
          </button>
          <button className="placement-btn" onClick={cyclePlacement}>
            Placement: {placement}
          </button>
        </div>

        {visible && (
          <div
            className="popover-positioned"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 1000,
            }}
          >
            <Popover
              placement={placement}
              arrowAlign="center"
              width={popoverWidth}
              height={popoverHeight}
              theme={theme}
            >
              <div style={{ fontSize: 13, color: titleColor, textAlign: 'center' }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Popover</div>
                <div style={{ fontSize: 12, color: subColor }}>placement: {placement}</div>
              </div>
            </Popover>
          </div>
        )}
      </div>
    </div>
  )
}
