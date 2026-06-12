import { onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Scroll-reveal composable — adds 'revealed' class when elements enter viewport.
 * Uses MutationObserver with debounce to handle dynamically rendered content.
 */
export function useReveal() {
  let observer: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const observe = () => {
    if (!observer) return
    document.querySelectorAll('.reveal:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed)').forEach((el) => {
      observer!.observe(el)
    })
  }

  const debouncedObserve = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      nextTick(observe)
    }, 100)
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )

    // Initial observe
    observe()

    // Watch for new elements added to the page (debounced)
    mutationObserver = new MutationObserver((mutations) => {
      // Only re-observe if new nodes were added
      const hasNewNodes = mutations.some(m => m.addedNodes.length > 0)
      if (hasNewNodes) {
        debouncedObserve()
      }
    })

    // Only observe the main content area, not the entire body
    const mainEl = document.querySelector('.main') || document.body
    mutationObserver.observe(mainEl, {
      childList: true,
      subtree: true,
    })
  })

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    mutationObserver?.disconnect()
    observer?.disconnect()
  })
}
