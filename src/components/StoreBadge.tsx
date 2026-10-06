import { isOnPlayStore, site } from '../site.config'

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
      <path d="M4 3.5v17a1 1 0 0 0 1.5.86l14.2-8.5a1 1 0 0 0 0-1.72L5.5 2.64A1 1 0 0 0 4 3.5z" fill="currentColor" />
    </svg>
  )
}

/** Google Play call to action; a non-interactive "Coming soon" state until the listing URL is configured. */
export function StoreBadge() {
  if (!isOnPlayStore()) {
    return (
      <span className="store-badge is-soon" role="note">
        <PlayIcon />
        <span className="store-badge-text">
          <small>Coming soon to</small>
          Google Play
        </span>
      </span>
    )
  }
  return (
    <a className="store-badge" href={site.playStoreUrl} rel="noopener">
      <PlayIcon />
      <span className="store-badge-text">
        <small>Get it on</small>
        Google Play
      </span>
    </a>
  )
}
