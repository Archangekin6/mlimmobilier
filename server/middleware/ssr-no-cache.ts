export default defineEventHandler((event) => {
  const accept = getHeader(event, 'accept') || ''

  if (event.method === 'GET' && accept.includes('text/html')) {
    setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0, must-revalidate')
  }
})
