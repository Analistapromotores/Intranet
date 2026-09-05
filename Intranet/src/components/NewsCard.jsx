import InstagramFeed from './InstagramFeed.jsx'
import { IconInstagram } from './Icons.jsx'
import { IG_PROFILE_URL } from '../config.js'

export default function NewsCard() {
  return (
    <section className="news card" aria-labelledby="news-title">
      <div className="card__head">
        <IconInstagram className="card__head-icon" width={20} height={20} />
        <h2 id="news-title" className="card__title">Noticias destacadas</h2>
        <a
          className="card__link"
          href={IG_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Ver Instagram
        </a>
      </div>

      <InstagramFeed />
    </section>
  )
}
