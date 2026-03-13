import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    // Scroll to top only on new navigations (PUSH/REPLACE), not when going back/forward (POP)
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0)
    }
  }, [pathname, navigationType])

  return null
}

export default ScrollToTop
