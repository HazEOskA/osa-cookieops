import { useEffect, useMemo, useState } from 'react';
import { StatusRail } from './components/StatusRail';
import { readWallet } from './lib/chain';
import {
  connectNightly,
  disconnectNightly,
  isNightlyInstalled,
  sendCookieOpsEvidence,
  sha256Hex,
  type IntentStage,
  type WalletAccount,
} from './lib/nightly';

const COOKIE_EXPLORER = 'https://cookiescan.io';
const BRIDGE_URL = 'https://hyperlane.cookiescan.io';
const STORAGE_KEY = 'osa-cookieops:last-intent';

type WalletSnapshot = Awaited<ReturnType<typeof readWallet>>;

type Evidence = {
  stage: IntentStage;
  signature: string;
  slot: number | null;
  explorerUrl: string;
  confirmedAt: number;
};

type IntentRecord = {
  id: string;
  owner: string;
  payload: string;
  payloadHash: string;
  stage: IntentStage;
  evidence: Evidence[];
};

function restoreIntent(): IntentRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as IntentRecord : null;
  } catch {
    return null;
  }
}

function saveIntent(intent: IntentRecord | null) {
  if (!intent) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export default function App() {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [intent, setIntent] = useState<IntentRecord | null>(() => restoreIntent());
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const nightlyDetected = useMemo(() => isNightlyInstalled(), []);

  useEffect(() => {
    if (!account) return;
    readWallet(account.address).then(setSnapshot).catch(() => setSnapshot(null));
  }, [account]);

  async function connect() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const connected = await connectNightly();
      setAccount(connected);
      setSnapshot(await readWallet(connected.address));
      setNotice('Nightly połączony z CookieOps. Przed podpisaniem upewnij się, że Nightly używa Cookie Chain RPC.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się połączyć Nightly.');
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    await disconnectNightly();
    setAccount(null);
    setSnapshot(null);
    setNotice('Portfel odłączony lokalnie.');
  }

  async function transact(stage: IntentStage) {
    if (!account) {
      setError('Najpierw połącz Nightly.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice(`Oczekiwanie na podpis Nightly: ${stage}…`);

    try {
      let working = intent;
      if (stage === 'PROPOSED') {
        const payload = JSON.stringify({
          action: 'DEMO_PING',
          owner: account.address,
          createdAt: Date.now(),
          policy: 'owner-approved-three-stage-evidence',
        });
        const payloadHash = await sha256Hex(payload);
        working = {
          id: `${Date.now().toString(36)}-${payloadHash.slice(0, 10)}`,
          owner: account.address,
          payload,
          payloadHash,
          stage: 'PROPOSED',
          evidence: [],
        };
      }

      if (!working) throw new Error('Brak intentu do zatwierdzenia.');
      if (working.owner !== account.address) throw new Error('Intent należy do innego portfela Nightly. Wyczyść go i rozpocznij nowy flow.');

      const result = await sendCookieOpsEvidence({
        account,
        intentId: working.id,
        payloadHash: working.payloadHash,
        stage,
      });

      const next: IntentRecord = {
        ...working,
        stage,
        evidence: [
          ...working.evidence,
          {
            stage,
            signature: result.signature,
            slot: result.slot,
            explorerUrl: result.explorerUrl,
            confirmedAt: Date.now(),
          },
        ],
      };
      setIntent(next);
      saveIntent(next);
      setSnapshot(await readWallet(account.address));
      setNotice(`${stage} potwierdzone na Cookie Chain. Evidence zapisane.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transakcja nie powiodła się.');
      setNotice('');
    } finally {
      setLoading(false);
    }
  }

  function resetIntent() {
    setIntent(null);
    saveIntent(null);
    setError('');
    setNotice('Lokalny intent wyczyszczony. On-chain evidence pozostaje niezmienne.');
  }

  const nextStage: IntentStage | null = !intent
    ? 'PROPOSED'
    : intent.stage === 'PROPOSED'
      ? 'APPROVED'
      : intent.stage === 'APPROVED'
        ? 'EXECUTED'
        : null;

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">OSA / COOKIE CHAIN CONTROL PLANE</p>
          <h1>CookieOps</h1>
          <p className="lede">Agent proponuje. Operator zatwierdza. Cookie Chain zapisuje dowód.</p>
        </div>
        <div className="heroLinks">
          <a className="ghost" href={BRIDGE_URL} target="_blank" rel="noreferrer">Bridge COOK ↗</a>
          <a className="ghost" href={COOKIE_EXPLORER} target="_blank" rel="noreferrer">Cookiescan ↗</a>
        </div>
      </header>

      <section className="panel walletPanel">
        <div className="panelHead">
          <div>
            <p className="kicker">NIGHTLY / COOKIE CHAIN</p>
            <h2>Portfel operatora</h2>
          </div>
          <span className={nightlyDetected ? 'live' : 'warn'}>{nightlyDetected ? 'NIGHTLY DETECTED' : 'NIGHTLY REQUIRED'}</span>
        </div>

        <div className="walletActions">
          {account ? (
            <>
              <div className="walletIdentity">
                <span>CONNECTED</span>
                <strong>{account.address}</strong>
              </div>
              <button className="secondary" onClick={disconnect} disabled={loading}>ODŁĄCZ</button>
            </>
          ) : (
            <button className="primary" onClick={connect} disabled={loading}>{loading ? 'ŁĄCZĘ…' : 'POŁĄCZ NIGHTLY'}</button>
          )}
        </div>

        {snapshot && (
          <div className="metrics">
            <article><span>COOK</span><strong>{snapshot.cook.toFixed(6)}</strong></article>
            <article><span>SLOT</span><strong>{snapshot.slot}</strong></article>
            <article><span>RECENT TX</span><strong>{snapshot.signatures.length}</strong></article>
          </div>
        )}
        <p className="micro">Nightly musi mieć ustawiony custom SVM RPC: https://rpc.cookiescan.io. Każda faza poniżej to osobna realna transakcja i kosztuje minimalny fee w COOK.</p>
      </section>

      {(notice || error) && <section className={`feedback ${error ? 'feedbackError' : ''}`}>{error || notice}</section>}

      <section className="grid">
        <article className="panel intentPanel">
          <div className="panelHead">
            <div>
              <p className="kicker">REAL ON-CHAIN INTENT</p>
              <h2>DEMO_PING</h2>
            </div>
            <span className="stageBadge">{intent?.stage || 'READY'}</span>
          </div>
          <p className="muted">CookieOps zapisuje ten sam payload hash w trzech Memo TX-ach. Nie ma custody, transferu ani fake success — liczy się tylko confirmation z Cookie Chain RPC.</p>
          <StatusRail stage={intent?.stage || 'READY'} />

          <div className="intentMeta">
            <div><span>INTENT</span><strong>{intent?.id || 'not-created'}</strong></div>
            <div><span>PAYLOAD SHA-256</span><strong>{intent?.payloadHash || '—'}</strong></div>
          </div>

          <div className="ctaRow">
            {nextStage ? (
              <button className="primary" onClick={() => transact(nextStage)} disabled={loading || !account}>
                {loading ? 'PODPIS / CONFIRM…' : `${nextStage} ON-CHAIN`}
              </button>
            ) : (
              <span className="done">✓ FLOW EXECUTED</span>
            )}
            {intent && <button className="secondary" onClick={resetIntent} disabled={loading}>NOWY INTENT</button>}
          </div>
        </article>

        <article className="panel evidence">
          <p className="kicker">TRANSACTION EVIDENCE</p>
          <h2>Confirmation, nie obietnica</h2>
          {intent?.evidence.length ? (
            <ol className="evidenceList">
              {intent.evidence.map((item) => (
                <li key={item.signature}>
                  <div>
                    <strong>{item.stage}</strong>
                    <span>{item.slot === null ? 'slot pending' : `slot ${item.slot}`}</span>
                  </div>
                  <a href={item.explorerUrl} target="_blank" rel="noreferrer">{item.signature.slice(0, 10)}… ↗</a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">Po pierwszym podpisie pojawi się tu signature + slot + link do CookieScan.</p>
          )}
        </article>
      </section>

      <section className="panel explainer">
        <p className="kicker">CO TO ROBI?</p>
        <h2>Bezpieczny audyt działań agenta</h2>
        <p className="muted">Agent może przygotować zamiar działania, ale operator Nightly musi jawnie podpisać PROPOSED, APPROVED i EXECUTED. Każdy etap trafia na Cookie Chain jako memo z tym samym hashem payloadu, więc historia jest publicznie weryfikowalna i nie da się udawać wykonania bez transakcji.</p>
      </section>
    </main>
  );
}
