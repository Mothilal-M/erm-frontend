import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { Suspense, useEffect } from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import { PersistGate } from "redux-persist/integration/react"

import ErrorBoundary from "@/components/error-boundary"
import { onAuthChange } from "@/lib/firebase"
import { ThemeProvider } from "@/lib/context/theme-provider"
import { asyncStoragePersister, queryClient } from "@/lib/query-client"
import { store, persistor } from "@store/"
import { logout } from "@store/slices/user.slice"

import router from "./route/index"

/**
 * Listens for Firebase auth state changes.
 * If the Firebase session ends (e.g. token revoked, user deleted),
 * automatically log out from Redux so the UI redirects to login.
 */
const FirebaseAuthSync = () => {
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      const { isAuthenticated } = store.getState().user
      if (!firebaseUser && isAuthenticated) {
        store.dispatch(logout())
      }
    })
    return unsubscribe
  }, [])

  return null
}

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{ persister: asyncStoragePersister }}
            >
              <ThemeProvider>
                <FirebaseAuthSync />
                <RouterProvider router={router} />
              </ThemeProvider>
            </PersistQueryClientProvider>
          </PersistGate>
        </Provider>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
