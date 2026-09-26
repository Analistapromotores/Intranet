/* Utilidades de video: URLs de reproductores incrustados. */
export const youtubeEmbed = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
export const youtubePoster = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const esVideoDirecto = (url) => /\.(mp4|webm|mov)(\?|#|$)/i.test(String(url || ''))
