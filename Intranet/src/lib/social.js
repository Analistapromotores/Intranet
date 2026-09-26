/* Redes sociales: datos de cada red y conversión de un enlace público en su versión incrustable.
   Sin librerías ni tokens: cada red publica una URL de "embed" que se arma a partir del enlace normal.
   (Se evaluó react-social-media-embed; carga scripts de terceros en cada tarjeta y no cubre YouTube por canal.) */

export const REDES = {
  instagram: { nombre: 'Instagram', color: '#e1306c', ejemplo: 'https://www.instagram.com/p/…' },
  facebook: { nombre: 'Facebook', color: '#1877f2', ejemplo: 'https://www.facebook.com/…/posts/…' },
  linkedin: { nombre: 'LinkedIn', color: '#0a66c2', ejemplo: 'https://www.linkedin.com/posts/…-activity-…' },
  youtube: { nombre: 'YouTube', color: '#e51d2a', ejemplo: 'https://www.youtube.com/watch?v=…' },
}
export const ORDEN_REDES = Object.keys(REDES)

const analizar = (raw) => {
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(String(raw).trim()) ? String(raw).trim() : `https://${String(raw).trim()}`)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return { u, host: u.hostname.replace(/^(www|m|web)\./, '') }
  } catch {
    return null
  }
}

/* A qué red pertenece un enlace (o null). */
export function redDe(raw) {
  const a = analizar(raw)
  if (!a) return null
  const { host } = a
  if (host === 'youtu.be' || host.endsWith('youtube.com')) return 'youtube'
  if (host.endsWith('instagram.com')) return 'instagram'
  if (host.endsWith('facebook.com') || host === 'fb.watch' || host === 'fb.com') return 'facebook'
  if (host.endsWith('linkedin.com')) return 'linkedin'
  if (host.endsWith('tiktok.com')) return 'tiktok'
  if (host.endsWith('vimeo.com')) return 'vimeo'
  return null
}

/* { red, src, ratio } (proporción ancho/alto) o { red, src, alto } (altura fija). null si no se puede incrustar. */
export function embedDe(raw) {
  const a = analizar(raw)
  if (!a) return null
  const { u, host } = a
  const red = redDe(raw)
  const partes = u.pathname.split('/').filter(Boolean)

  if (red === 'youtube') {
    let id = null
    if (host === 'youtu.be') id = partes[0]
    else if (u.searchParams.get('v')) id = u.searchParams.get('v')
    else if (['shorts', 'embed', 'live', 'v'].includes(partes[0])) id = partes[1]
    if (id && /^[\w-]{6,20}$/.test(id)) {
      const corto = partes[0] === 'shorts'
      return { red, src: `https://www.youtube-nocookie.com/embed/${id}`, ...(corto ? { alto: 640 } : { ratio: 16 / 9 }) }
    }
    /* Un canal sin video concreto: se muestra su lista de subidas (siempre el más reciente primero). */
    const canal = partes[0] === 'channel' ? partes[1] : null
    if (canal && /^UC[\w-]{20,}$/.test(canal)) return { red, src: `https://www.youtube-nocookie.com/embed/videoseries?list=UU${canal.slice(2)}`, ratio: 16 / 9, canal: true }
    return null
  }
  if (red === 'vimeo') {
    const id = partes.find((p) => /^\d+$/.test(p))
    return id ? { red, src: `https://player.vimeo.com/video/${id}`, ratio: 16 / 9 } : null
  }
  if (red === 'instagram') {
    const i = partes.findIndex((p) => ['p', 'reel', 'reels', 'tv'].includes(p))
    const code = i >= 0 ? partes[i + 1] : null
    /* Un perfil (sin publicación concreta): su propio «embed» muestra las últimas publicaciones y se actualiza solo. */
    if (!code) {
      const usuario = partes[0]
      return usuario && /^[\w.]{2,30}$/.test(usuario) && !['explore', 'accounts', 'direct', 'stories'].includes(usuario)
        ? { red, src: `https://www.instagram.com/${usuario}/embed/`, alto: 640, auto: true }
        : null
    }
    return { red, src: `https://www.instagram.com/${partes[i] === 'reels' ? 'reel' : partes[i]}/${code}/embed/captioned/`, alto: 620 }
  }
  if (red === 'facebook') {
    const video = /\/(videos?|reel|watch)\b/.test(u.pathname) || host === 'fb.watch'
    const href = encodeURIComponent(u.href)
    /* Una página (un solo tramo, p. ej. /GestionGYS): el plugin de página muestra su cronología y se actualiza solo. */
    if (partes.length === 1 && !['share', 'watch', 'photo', 'permalink.php', 'story.php', 'profile.php', 'groups', 'people'].includes(partes[0])) {
      return { red, src: `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(`https://www.facebook.com/${partes[0]}`)}&tabs=timeline&width=500&height=640&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`, alto: 640, auto: true }
    }
    return video
      ? { red, src: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=500`, ratio: 16 / 9 }
      : { red, src: `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true&width=500`, alto: 620 }
  }
  if (red === 'tiktok') {
    const i = partes.indexOf('video')
    const id = i >= 0 ? partes[i + 1] : null
    return id && /^\d+$/.test(id) ? { red, src: `https://www.tiktok.com/embed/v2/${id}`, alto: 740 } : null
  }
  if (red === 'linkedin') {
    const m = /(activity|ugcPost|share)[-:](\d{10,})/.exec(u.pathname) || /urn:li:(activity|ugcPost|share):(\d{10,})/.exec(decodeURIComponent(u.pathname))
    return m ? { red, src: `https://www.linkedin.com/embed/feed/update/urn:li:${m[1]}:${m[2]}`, alto: 640 } : null
  }
  return null
}
