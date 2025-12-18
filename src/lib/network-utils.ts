// Utilitaires pour obtenir l'IP locale de l'ordinateur

export function getLocalIP(): Promise<string> {
  return new Promise((resolve, reject) => {
    // En Electron, on peut utiliser l'API réseau
    if (typeof window !== 'undefined' && (window as any).require) {
      const os = (window as any).require('os')
      const interfaces = os.networkInterfaces()
      
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
          // Ignorer les adresses internes et non-IPv4
          if (iface.family === 'IPv4' && !iface.internal) {
            resolve(iface.address)
            return
          }
        }
      }
    }
    
    // Fallback: utiliser localhost (ne fonctionnera pas depuis iPhone)
    resolve('localhost')
  })
}

export async function getCalendarSubscriptionUrl(token: string): Promise<string> {
  const isElectron = typeof window !== 'undefined' && (window as any).require
  
  if (isElectron) {
    try {
      const ip = await getLocalIP()
      const port = window.location.port || '3000'
      return `http://${ip}:${port}/api/calendar/ical?token=${token}`
    } catch {
      // Fallback sur localhost
    }
  }
  
  // En développement ou si on ne peut pas obtenir l'IP
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  return `${origin}/api/calendar/ical?token=${token}`
}


