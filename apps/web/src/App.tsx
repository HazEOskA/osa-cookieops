import { FormEvent, useState } from 'react';
import { StatusRail } from './components/StatusRail';
import { readWallet } from './lib/chain';

const COOKIE_EXPLORER = 'https://cookiescan.io';

type WalletSnapshot = Awaited<ReturnType<typeof readWallet>>;

export default function App() {
  const [address, setAddress] = useState('');
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function scan(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      setSnapshot(await readWallet(address.trim()));
    } catch (err) {
      setSnapshot(null);
      setError(err instanceof Error ? err.message : 'Nie udało się odczytać portfela');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">OSA / COOKIE CHAIN CONTROL PLANE</p>
          <h1>CookieOps</h1>
          <p className="lede">Agent proponuje. Operator zatwierdza. Chain daje dowód.</p>
        </div>
        <a className="ghost" href={COOKIE_EXPLORER} target="_blank" rel="noreferrer">Cookiescan ↗</a>
      </header>

      <section className="panel">
        <div className="panelHead">
          <div>
            <p className="kicker">READ-ONLY RADAR</p>
            <h2>Skan portfela Cookie Chain</h2>
          </div>
          <span className="live">RPC LIVE TARGET</span>
        </div>
        <form className="scan" onSubmit={scan}>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adres SVM / Nightly" aria-label="Adres portfela" />
          <button disabled={loading || !address.trim()}>{loading ? 'SKANUJĘ…' : 'SKANUJ'}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {snapshot && (
          <div className="metrics">
            <article><span>COOK</span><strong>{snapshot.cook.toFixed(6)}</strong></article>
            <article><span>SLOT</span><strong>{snapshot.slot}</strong></article>
            <article><span>TX</span><strong>{snapshot.signatures.length}</strong></article>
          </div>
        )}
      </section>

      <section className="grid">
        <article className="panel">
          <p className="kicker">INTENT</p>
          <h2>DEMO_PING</h2>
          <p className="muted">MVP nie dotyka środków. Pierwsza akcja udowadnia approval-bound execution na własnym programie.</p>
          <StatusRail stage="PROPOSED" />
        </article>
        <article className="panel evidence">
          <p className="kicker">EVIDENCE</p>
          <h2>Zero fake execution</h2>
          <ul>
            <li>payload SHA-256</li>
            <li>owner-bound PDA</li>
            <li>expiry guard</li>
            <li>created / executed slot</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
