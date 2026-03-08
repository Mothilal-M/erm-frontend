/* eslint-disable no-restricted-globals */
/**
 * Service Worker for PWA
 *
 * Features:
 * - Cache-first strategy for static assets
 * - Network-first strategy for API calls
 * - Offline fallback page
 * - Background sync
 * - Push notifications (optional)
 */

const CACHE_NAME = "frontend-base-v1"
const API_CACHE_NAME = "frontend-base-api-v1"
const OFFLINE_URL = "/offline.html"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  // Add your critical CSS/JS files here after build
  // '/assets/index-[hash].js',
  // '/assets/index-[hash].css',
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME)
        console.log("[Service Worker] Caching static assets")
        await cache.addAll(STATIC_ASSETS)
        console.log("[Service Worker] Static assets cached")

        // Force the waiting service worker to become the active service worker
        await self.skipWaiting()
      } catch (error) {
        console.error("[Service Worker] Installation failed:", error)
      }
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")

  event.waitUntil(
    (async () => {
      // Enable navigation preload if available
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable()
      }

      // Clean up old caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )

      // Take control of all pages immediately
      await self.clients.claim()
      console.log("[Service Worker] Activated")
    })()
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME))
    return
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|avif|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME))
    return
  }

  // HTML pages - network first, cache fallback, offline page as last resort
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request)

          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, networkResponse.clone())
          }

          return networkResponse
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }

          // No cache, return offline page
          const offlineResponse = await caches.match(OFFLINE_URL)
          if (offlineResponse) {
            return offlineResponse
          }

          // Last resort - return error
          return new Response("Offline and no cached version available", {
            status: 503,
            statusText: "Service Unavailable",
          })
        }
      })()
    )
    return
  }

  // Default - network only
  event.respondWith(fetch(request))
})

/**
 * Cache-first strategy
 * Try cache first, then network, then cache old version
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Not in cache, try network
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache again (might have old version)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    throw error
  }
}

/**
 * Network-first strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    throw error
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag)

  if (event.tag === "sync-offline-requests") {
    event.waitUntil(syncOfflineRequests())
  }
})

async function syncOfflineRequests() {
  try {
    // Get offline requests from IndexedDB or localStorage
    // Send them to the server
    console.log("[Service Worker] Syncing offline requests...")

    // Implementation depends on your offline storage strategy
    // This is a placeholder
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error)
    throw error // Retry sync
  }
}

// Push notification support (optional)
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "No payload",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification("Frontend Base", options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked")

  event.notification.close()

  event.waitUntil(
    clients.openWindow("/")
  )
})

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      })
    )
  }
})
