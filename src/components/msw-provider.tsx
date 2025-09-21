export function MSWProvider({ children }: { children: React.ReactNode }) {
  // Since we're using API routes instead of MSW, we don't need database initialization
  // in the browser. The API routes handle database operations on the server side.
  return <>{children}</>
}