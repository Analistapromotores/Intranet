import VideoPlayer from './VideoPlayer.jsx'
import { youtubeEmbed, youtubePoster } from '../lib/video.js'

/* Video de YouTube: miniatura liviana; al pulsar se abre el visor de cristal de la intranet.
   Usa youtube-nocookie para no dejar cookies de seguimiento hasta reproducir. */
export default function LiteYouTube({ id, titulo, className = '' }) {
  return <VideoPlayer embed={youtubeEmbed(id)} poster={youtubePoster(id)} titulo={titulo} className={className} />
}
