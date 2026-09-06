type Stage = 'PROPOSED' | 'APPROVED' | 'EXECUTED';

export function StatusRail({ stage }: { stage: Stage }) {
  const stages: Stage[] = ['PROPOSED', 'APPROVED', 'EXECUTED'];
  const current = stages.indexOf(stage);
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
