interface Props { skill: string; variant?: 'match'|'missing'|'neutral' }
export default function SkillPill({ skill, variant='neutral' }: Props) {
  const cls = variant === 'match' ? 'pill-match' : variant === 'missing' ? 'pill-missing' : 'pill-neutral'
  return <span className={cls}>{skill}</span>
}
