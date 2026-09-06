import type { IntentStage } from '../lib/nightly';

type Stage = 'READY' | IntentStage;

export function StatusRail({ stage }: { stage: Stage }) {
  const stages: IntentStage[] = ['PROPOSED', 'APPROVED', 'EXECUTED'];
  const current = stage === 'READY' ? -1 : stages.indexOf(stage);
  return (
    <div className="rail" aria-label="Intent lifecycle">
      {stages.map((item, index) => (
        <div className={`railItem ${index <= current ? 'active' : ''}`} key={item}>
          <span className="dot" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
