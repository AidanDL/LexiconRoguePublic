import { useEffect, useRef, type ReactNode } from 'react'
import { Page } from '../components/SiteChrome'
import { paths } from '../paths'
import { formatDate, PLACEHOLDER, site } from '../site.config'
import { headingFor, policySections, type PolicySectionId } from './policySections'

/** Shows [value], or a highlighted reminder while it is still a placeholder. */
function Fill({ value, label }: { value: string; label: string }) {
  if (value === PLACEHOLDER) return <span className="placeholder">[{label}]</span>
  return <>{value}</>
}

function ContactLink(): ReactNode {
  if (site.contactEmail === PLACEHOLDER) return <Fill value={site.contactEmail} label="contact email" />
  return <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} rel="noopener">
      {children}
    </a>
  )
}

function Section({ id, children }: { id: PolicySectionId; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{headingFor(id)}</h2>
      {children}
    </section>
  )
}

const GOOGLE_PRIVACY = 'https://policies.google.com/privacy'
const GOOGLE_PARTNERS = 'https://policies.google.com/technologies/partner-sites'

/** The Lexicon Rogue privacy policy. */
export function Privacy() {
  const updated = formatDate(site.privacyLastUpdated)
  const toc = useRef<HTMLDetailsElement>(null)
  // The contents list is open in the pre-rendered page (readable without JavaScript); on narrow screens,
  // where it would push the policy a screen down, fold it away once the page is interactive.
  useEffect(() => {
    if (toc.current && window.matchMedia?.('(max-width: 1023px)').matches) toc.current.open = false
  }, [])
  const game = site.gameName
  return (
    <Page page="privacy">
      <div className="policy-wrap container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={paths.home}>{game}</a>
            </li>
            <li aria-current="page">Privacy policy</li>
          </ol>
        </nav>

        <div className="policy-layout">
          <aside className="toc" aria-label="On this page">
            <details open ref={toc}>
              <summary className="toc-title">
                On this page <span className="toc-count">{policySections.length} sections</span>
              </summary>
              <ol>
              {policySections.map(([id, heading]) => (
                <li key={id}>
                  <a href={`#${id}`}>{heading}</a>
                </li>
              ))}
              </ol>
            </details>
          </aside>

          <article className="policy">
            <header className="policy-head">
              <p className="eyebrow">{game}</p>
              <h1>Privacy policy</h1>
              <p className="updated">
                Effective and last updated: <time dateTime={site.privacyLastUpdated}>{updated}</time>
              </p>
            </header>

            <Section id="summary">
              <div className="summary">
                <ul>
                  <li>
                    <strong>No account, no name, no email.</strong> We don’t ask who you are, and your game progress is
                    saved on your device.
                  </li>
                  <li>
                    <strong>Google services do collect some data.</strong> Ads (Google AdMob) use your advertising ID
                    and device information; Firebase records how the game is used and why it crashes; Google Play
                    handles purchases, and Play Games (if you sign in) handles leaderboards, achievements and cloud
                    save.
                  </li>
                  <li>
                    <strong>You choose.</strong> Where the law requires it, Google’s consent message asks before ads
                    use your data, and you can change your answer in <strong>Settings → Privacy options</strong>.
                    Reminders are off unless you turn them on.
                  </li>
                  <li>
                    <strong>We never sell your data</strong>, and we don’t run our own servers that receive it.
                  </li>
                  <li>
                    Questions or requests? Email <ContactLink />.
                  </li>
                </ul>
              </div>
            </Section>

            <Section id="who-we-are">
              <p>
                {game} (Android package <code>{site.androidPackage}</code>) is developed and published by{' '}
                <Fill value={site.developerName} label="developer name" /> (“we”, “us”). This policy explains what
                information is collected when you play {game}, why, who receives it and the choices you have. For
                the purposes of data protection law, we are the controller of the information described here, and
                Google acts as our service provider (processor) or, for some advertising purposes, as an independent
                controller.
              </p>
            </Section>

            <Section id="what-we-collect">
              <p>
                <strong>We don’t collect your name, email address, phone number, contacts, photos, files or precise
                location</strong>, and the game has no account sign-up. There is no chat and no user-generated
                content.
              </p>
              <p>The game uses these Google services, which collect information directly from your device:</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Service</th>
                      <th scope="col">What it handles</th>
                      <th scope="col">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Google AdMob</th>
                      <td data-label="What it handles">Advertising ID, IP address, device and app information, ad interactions</td>
                      <td data-label="Why">Showing and measuring rewarded and interstitial ads, fraud prevention</td>
                    </tr>
                    <tr>
                      <th scope="row">Firebase Analytics</th>
                      <td data-label="What it handles">App interactions (such as runs started, words played, shop actions), app instance ID, device information</td>
                      <td data-label="Why">Understanding how the game is played so we can balance and improve it</td>
                    </tr>
                    <tr>
                      <th scope="row">Firebase Crashlytics</th>
                      <td data-label="What it handles">Crash reports and diagnostics</td>
                      <td data-label="Why">Finding and fixing bugs</td>
                    </tr>
                    <tr>
                      <th scope="row">Firebase Remote Config</th>
                      <td data-label="What it handles">Firebase installation ID, app version</td>
                      <td data-label="Why">Fetching game tuning values</td>
                    </tr>
                    <tr>
                      <th scope="row">Google Play Games Services (optional)</th>
                      <td data-label="What it handles">Your Play Games profile, scores, achievements, cloud-saved game progress</td>
                      <td data-label="Why">Leaderboards, achievements and cloud backup</td>
                    </tr>
                    <tr>
                      <th scope="row">Google Play Billing</th>
                      <td data-label="What it handles">Purchase history</td>
                      <td data-label="Why">Processing and delivering in-app purchases</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>Each is described below. All of them send data over encrypted (TLS) connections.</p>
            </Section>

            <Section id="on-device">
              <p>So you can pick up where you left off, the game saves the following in its private storage on your device:</p>
              <ul>
                <li>game progress: any run in progress, Quills, unlocked Glyphs, Bags and Stakes, the Codex, achievements, statistics such as runs played and your longest word, Daily Run results and your streak;</li>
                <li>settings, such as sound, haptics, reduced motion and large tiles, and your reminder choices;</li>
                <li>whether you’ve bought Remove Ads or made any purchase, and small counters that limit how often ads and rating requests appear.</li>
              </ul>
              <p>
                This information is not sent to us. It is copied to Google’s servers only if you use Play Games cloud
                save (see <a href="#play-games">Google Play Games Services</a>).
              </p>
            </Section>

            <Section id="advertising">
              <p>
                {game} is free to play and shows ads through the Google Mobile Ads SDK (Google AdMob): optional{' '}
                <strong>rewarded ads</strong> that you choose to watch (for example for a shop reroll, a revive, a
                free Ink or double Quills) and occasional <strong>interstitial ads</strong> between runs.{' '}
                <strong>Interstitial ads are never shown to players who have made any purchase.</strong>
              </p>
              <p>To show, measure and improve ads and to prevent fraud, Google may collect and process:</p>
              <ul>
                <li>your device’s advertising ID and app set ID;</li>
                <li>your IP address, which can be used to estimate your general location (such as country or city);</li>
                <li>device and app information, such as device model, operating system and app version;</li>
                <li>ad interactions, such as which ads were shown, watched or tapped, plus diagnostic and performance data.</li>
              </ul>
              <p>
                Depending on your consent choices and where you live, ads may be personalised (based on your
                interests) or non-personalised (based on more limited data such as general location and the app
                you’re using). Google’s use of this information is governed by the{' '}
                <Ext href={GOOGLE_PRIVACY}>Google Privacy Policy</Ext>; see also{' '}
                <Ext href={GOOGLE_PARTNERS}>How Google uses information from sites or apps that use our services</Ext>{' '}
                and <Ext href="https://policies.google.com/technologies/ads">How Google uses advertising</Ext>.
              </p>
            </Section>

            <Section id="consent">
              <p>
                The game uses Google’s <strong>User Messaging Platform (UMP)</strong> to ask for your choices before
                ads are requested. Where the law requires it, including in the European Economic Area, the UK and
                Switzerland (GDPR) and in US states with privacy laws, you’ll see Google’s message the first time you
                open the game: you can consent to personalised ads, decline, or opt out of the “sale” or “sharing” of
                your information for advertising.
              </p>
              <p>
                You can change your choice at any time from <strong>Settings → Privacy options</strong> in the game.
                (This option appears where your region’s privacy rules make it available.) You can also reset or
                delete your advertising ID, or turn off ad personalisation, in your Android settings (usually{' '}
                <em>Settings → Privacy → Ads</em> or <em>Settings → Google → Ads</em>).
              </p>
            </Section>

            <Section id="firebase">
              <p>We use three Firebase services from Google:</p>
              <ul>
                <li>
                  <strong>Firebase Analytics</strong> records app interactions, such as runs started and finished,
                  blinds played, words played (length, score and whether they were valid), shop visits and purchases,
                  ad offers watched, tutorial steps and share taps, along with an app instance ID, device and app
                  information and an approximate location derived from your IP address. Where available it may also
                  use your device’s advertising ID. We see this as aggregated statistics; it is not used to identify
                  you.
                </li>
                <li>
                  <strong>Firebase Crashlytics</strong> sends a crash report when the game crashes or hits a serious
                  error: the error and stack trace, device model, operating system and app version, and a Crashlytics
                  installation ID. Crash reporting is switched on in release builds only.
                </li>
                <li>
                  <strong>Firebase Remote Config</strong> fetches tuning values (such as how often interstitial ads may
                  appear) so we can adjust the game without an update. It uses a Firebase installation ID to deliver
                  them.
                </li>
              </ul>
              <p>
                See <Ext href="https://firebase.google.com/support/privacy">Privacy and Security in Firebase</Ext> and the{' '}
                <Ext href={GOOGLE_PRIVACY}>Google Privacy Policy</Ext>.
              </p>
            </Section>

            <Section id="play-games">
              <p>
                Signing in to <strong>Google Play Games</strong> is optional; the game plays fully without it. If you
                are signed in (Play Games may sign you in automatically), the game uses it for:
              </p>
              <ul>
                <li>
                  <strong>Leaderboards and achievements</strong>: your scores and unlocked achievements are submitted
                  to Play Games and shown with your Play Games profile name and avatar, according to your Play Games
                  visibility settings.
                </li>
                <li>
                  <strong>Saved Games cloud backup</strong>: a copy of your game progress (the on-device data listed
                  above) is stored in your Play Games account so you can restore it on another device.
                </li>
              </ul>
              <p>
                This data is tied to your Play Games account and handled by Google under the{' '}
                <Ext href={GOOGLE_PRIVACY}>Google Privacy Policy</Ext>. We don’t receive your email address.
              </p>
            </Section>

            <Section id="purchases">
              <p>
                Optional purchases (<strong>Remove Ads</strong> and <strong>Quill bundles</strong>) are processed by
                Google Play Billing. <strong>We never receive your payment card or billing details.</strong> The game
                receives a purchase confirmation from Google Play so it can deliver your item, restore purchases and
                stop interstitial ads, and records that on your device. There are no paid random items. Google’s
                handling of payments is described in the <Ext href={GOOGLE_PRIVACY}>Google Privacy Policy</Ext> and
                the{' '}
                <Ext href="https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice">
                  Google Payments Privacy Notice
                </Ext>
                .
              </p>
            </Section>

            <Section id="updates">
              <p>
                The game checks Google Play for newer versions (Google Play In-App Updates) and may occasionally ask
                you to rate it (Google Play In-App Review); both are handled by Google Play, and we don’t see your
                rating details through the game.
              </p>
              <p>
                Small fixes may also be delivered over the air by <strong>Shorebird</strong>, our code-update
                provider. To find the right update, the game sends Shorebird technical information only: the app’s
                release and patch version, the device platform and processor type, and a random install identifier
                generated by the updater. See the{' '}
                <Ext href="https://shorebird.dev/privacy/">Shorebird privacy policy</Ext>.
              </p>
            </Section>

            <Section id="notifications">
              <p>
                The game can remind you when the Daily Run is ready or when your streak is about to end. These are{' '}
                <strong>local notifications</strong>, scheduled on your device; no push service or push identifier is
                used. Reminders are opt-in: the game asks in context (for example after your first Daily Run) before
                showing Android’s permission prompt, and you can turn them off in the game’s settings or in Android’s
                notification settings at any time.
              </p>
            </Section>

            <Section id="permissions">
              <p>The game requests only these Android permissions:</p>
              <ul>
                <li><code>INTERNET</code> and <code>ACCESS_NETWORK_STATE</code>: ads, Firebase, Play Games and updates, and knowing when you’re offline;</li>
                <li><code>VIBRATE</code>: haptic feedback (you can turn it off in Settings);</li>
                <li><code>POST_NOTIFICATIONS</code>: Daily Run and streak reminders, only if you allow them;</li>
                <li><code>RECEIVE_BOOT_COMPLETED</code>: so scheduled reminders survive a restart of your phone.</li>
              </ul>
              <p>
                Google’s SDKs also add <code>com.google.android.gms.permission.AD_ID</code> (the advertising ID) and{' '}
                <code>com.android.vending.BILLING</code> (Google Play purchases). The game does{' '}
                <strong>not</strong> access your location, contacts, camera, microphone, photos or files.
              </p>
              <p>
                If you share a result card, Android’s share sheet sends the text you chose to the app you pick; it
                isn’t sent to us.
              </p>
            </Section>

            <Section id="sharing">
              <p>
                Information is shared only with the Google services above (Google LLC and its affiliates) and with
                Shorebird for updates, so they can provide their services to us. Google may also use advertising
                data as an independent controller as described in its policies. We may disclose information if
                required by law.
              </p>
              <p>
                <strong>We do not sell your personal information</strong> for money, and we don’t share it with data
                brokers.
              </p>
            </Section>

            <Section id="children">
              <p>
                {game} is not directed at children. Its target audience is people aged <strong>13 and over</strong>,
                and we do not knowingly collect personal information from children under 13. If you believe a child
                has provided information through the game, please contact us and we will help remove it.
              </p>
            </Section>

            <Section id="retention">
              <ul>
                <li>
                  <strong>On your device:</strong> kept until you erase it. Use <strong>Settings → Reset
                  progress</strong> in the game to erase your progress, or clear the app’s data or uninstall the game
                  to remove everything it stored.
                </li>
                <li>
                  <strong>Play Games:</strong> leaderboard entries, achievements and your cloud save are kept in your
                  Play Games account until you delete them, which you can do from the Play Games settings or your{' '}
                  <Ext href="https://myaccount.google.com/">Google Account</Ext>.
                </li>
                <li>
                  <strong>Firebase and AdMob:</strong> retained by Google according to its policies and our retention
                  settings (for example, Crashlytics keeps crash reports for up to 90 days). See{' '}
                  <Ext href="https://policies.google.com/technologies/retention">How Google retains data</Ext>.
                </li>
              </ul>
              <p>
                To ask us to delete analytics or crash data linked to your device, email <ContactLink />. Because we
                don’t know who you are, we may need help identifying the data (for example the date you played and
                your device model).
              </p>
            </Section>

            <Section id="rights-gdpr">
              <p>
                If you are in the EEA, the UK or Switzerland, you have the right to access, correct, delete, restrict
                or object to the processing of your personal data, to data portability, and to withdraw consent at
                any time (without affecting processing before you withdrew). We rely on your{' '}
                <strong>consent</strong> for personalised advertising, and on our <strong>legitimate interests</strong>{' '}
                in running, securing and improving the game for analytics, crash reporting, remote settings,
                non-personalised ads and fraud prevention. Purchases and cloud save are processed to{' '}
                <strong>perform our contract</strong> with you.
              </p>
              <p>
                To exercise your rights, email <ContactLink />; we’ll reply within one month. You can change ad
                consent yourself in <strong>Settings → Privacy options</strong>. You may also complain to your local
                data protection authority (in the UK, the Information Commissioner’s Office).
              </p>
            </Section>

            <Section id="rights-us">
              <p>
                If you live in a US state with a consumer privacy law (such as California under the CCPA/CPRA,
                Virginia, Colorado, Connecticut or Utah), you have the right to know what personal information is
                collected, to access and delete it, to correct it, and to opt out of its “sale”, “sharing” for
                cross-context behavioural advertising, or use for targeted advertising. We will not discriminate
                against you for using these rights.
              </p>
              <p>
                We don’t sell personal information for money. Personalised ads from Google AdMob may count as
                “sharing” or targeted advertising under some of these laws; you can opt out through Google’s
                message or <strong>Settings → Privacy options</strong>, or by turning off ad personalisation in your
                Android settings. Categories involved: identifiers (advertising ID, app instance and installation
                IDs), internet or other network activity (app interactions, ad interactions), approximate location
                from IP address, and purchase history. To make any other request, email <ContactLink />; you may use
                an authorised agent.
              </p>
            </Section>

            <Section id="security">
              <p>
                Game data on your device is kept in the app’s private storage, which Android keeps separate from
                other apps. All data sent by the game and Google’s services is encrypted in transit (TLS).
              </p>
            </Section>

            <Section id="transfers">
              <p>
                Google and Shorebird may process information in countries other than yours, including the United
                States. Google relies on safeguards such as the EU Standard Contractual Clauses and the EU–US Data
                Privacy Framework, as described in its privacy policy.
              </p>
            </Section>

            <Section id="changes">
              <p>
                We may update this policy, for example when the game adds a feature or a service. We’ll change the
                date at the top, and for significant changes we’ll tell players in the game or on this page before
                they take effect.
              </p>
            </Section>

            <Section id="contact">
              <p>
                Questions about this policy, or a privacy request? Contact{' '}
                <Fill value={site.developerName} label="developer name" /> at <ContactLink />.
              </p>
              <p className="back-home">
                <a href={paths.home}>← Back to {game}</a>
              </p>
            </Section>
          </article>
        </div>
      </div>
    </Page>
  )
}
