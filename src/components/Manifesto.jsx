import { useEffect, useRef, useState } from 'react'

function Manifesto() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      {
        threshold: 0.35,
        rootMargin: '0px 0px -15% 0px',
      }
    )
    observer.observe(el)
    // Trigger only when section is well in view on load (e.g. short viewport or scrolled)
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        if (rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.3) setVisible(true)
      })
    })
    // Failsafe: show only if section is in view after a delay (e.g. user scrolled)
    const timeoutId = setTimeout(() => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.75) setVisible(true)
    }, 2000)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
      clearTimeout(timeoutId)
    }
  }, [])

  const slideUp = 'animate-manifesto-slide will-change-[transform,opacity]'
  const stagger = (i) => ({ animationDelay: `${i * 140}ms` })

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black overflow-hidden"
      aria-labelledby="manifesto-heading"
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1430 669"
        fill="transparent"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <clipPath id="clip0_227_2010">
            <rect width="1430" height="669" fill="white" />
          </clipPath>
        </defs>
        <line
          opacity="0.08"
          x1="587"
          y1="632.5"
          x2="844"
          y2="632.5"
          stroke="#D1C7B7"
        />
      </svg>

      <div className="relative max-w-[1430px] min-h-0 md:min-h-[669px] mx-auto px-6 py-12 sm:py-16 md:py-20 lg:py-28 flex flex-col items-center justify-center text-center">
        <p
          id="manifesto-heading"
          className={`text-[#D1C7B7] text-xs md:text-sm font-normal tracking-[0.2em] uppercase mb-3 md:mb-4 ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(0) : undefined}
        >
          THE MANIFESTO.
        </p>

        <h2
          className={`text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-cormorant font-medium leading-tight max-w-3xl ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(1) : undefined}
        >
          Where Two Worlds
          <br />
          Converge.
        </h2>

        <div
          className={`w-16 h-px bg-[#E5E5E5] my-3 md:my-2 ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(2) : undefined}
          aria-hidden
        />

        <p
          className={`text-[#E5E5E5] text-sm md:text-base max-w-2xl leading-relaxed text-center ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(3) : undefined}
        >
          STRYDEEVA exists at the intersection of two worlds — where the richness of ethnic heritage meets the precision of modern design. We believe in clothing that speaks, in garments that carry stories, in fashion that moves with purpose.
        </p>

        <div
          className={`w-16 h-px bg-[#E5E5E5] my-4 md:my-6 ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(4) : undefined}
          aria-hidden
        />

        <a
          href="/narrative"
          className={`text-[#D1C7B7] text-xs md:text-sm font-normal tracking-[0.2em] uppercase hover:opacity-90 transition-opacity ${visible ? slideUp : 'opacity-0 translate-y-6'}`}
          style={visible ? stagger(5) : undefined}
        >
          DISCOVER THE NARRATIVE
        </a>
      </div>
    </section>
  )
}

export default Manifesto
