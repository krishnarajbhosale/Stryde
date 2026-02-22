import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import aboutBg from '../assets/AboutBackground.png'
import aboutFibre from '../assets/AboutFibreImage.png'

function AboutPage() {
  const [email, setEmail] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Optional: wire to your backend or analytics
  }

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen bg-[#0d0d0d]">
        {/* Main About section: textured background, two columns */}
        <section
          className="relative w-full min-h-[70vh] flex items-center py-12 md:py-20 overflow-hidden"
          aria-labelledby="about-heading"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${aboutBg})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-[#0d0d0d]/70" aria-hidden />
          <div className="relative z-10 max-w-[1430px] mx-auto px-4 md:px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left: heading + body text */}
              <div>
                <h1
                  id="about-heading"
                  className="font-cormorant font-medium text-3xl md:text-4xl lg:text-5xl text-[#E5E5E5] leading-tight mb-6 md:mb-8"
                >
                  Where Two Worlds Converge
                </h1>
                <div className="space-y-5 text-[#E5E5E5] text-base md:text-lg leading-relaxed max-w-xl">
                  <p>
                    STRYDEEVA was born from a simple observation: fashion has always been divided. Traditional versus contemporary. Heritage versus innovation. East versus West.
                  </p>
                  <p>
                    We rejected this binary. We saw that true elegance lies not in choosing sides, but in the graceful dance between them. Our garments are conversations — between the hands of artisans who have woven stories for generations and the minds of designers who dream of tomorrow.
                  </p>
                  <p>
                    Every thread carries intention. Every silhouette speaks of precision. Every piece exists as proof that duality is not division — it is depth.
                  </p>
                </div>
              </div>
              {/* Right: fibre image */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md aspect-[4/5] overflow-hidden bg-neutral-800">
                  <img
                    src={aboutFibre}
                    alt=""
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA: lighter gray background */}
        <section
          className="w-full py-16 md:py-20 bg-[#E5E5E5] text-[#1a1a1a]"
          aria-labelledby="newsletter-heading"
        >
          <div className="max-w-[600px] mx-auto px-4 md:px-6 text-center">
            <h2
              id="newsletter-heading"
              className="font-cormorant font-medium text-3xl md:text-4xl uppercase text-[#1a1a1a] mb-4"
            >
              Join Our Inner Circle
            </h2>
            <p className="text-[#1a1a1a]/90 text-sm md:text-base leading-relaxed mb-8">
              Be the first to know about new collections, exclusive drops, and special events. Enter your email below to subscribe to our newsletter.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 max-w-sm mx-auto sm:mx-0 px-4 py-3 text-sm bg-white border border-[#1a1a1a]/20 text-[#1a1a1a] placeholder:text-[#666] focus:outline-none focus:border-[#1a1a1a]/50 transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium tracking-wide uppercase bg-[#1a1a1a] text-[#E5E5E5] hover:bg-[#333] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default AboutPage
