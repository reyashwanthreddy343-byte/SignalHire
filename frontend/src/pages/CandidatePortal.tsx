import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCandidate, getOpenPool } from '@/utils/api'
import SkillPill from '@/components/shared/SkillPill'
import ATSOptimizer from '@/components/candidate/ATSOptimizer'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2,'Name required'),
  email: z.string().email('Valid email required'),
  headline: z.string().optional(),
  summary: z.string().optional(),
  skills: z.string().optional(),
  current_title: z.string().optional(),
  current_company: z.string().optional(),
  years_of_experience: z.coerce.number().min(0).max(50).optional(),
  location: z.string().optional(),
  github_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
})
type FD = z.infer<typeof schema>

interface ExpEntry { title:string; company:string; start_date:string; end_date:string; description:string; is_current:boolean }
interface EduEntry { degree:string; field_of_study:string; institution:string; start_year:string; end_year:string; cgpa:string }
interface ProjEntry { name:string; description:string; tech_stack:string; url:string }

/* ─── Reusable Field ─── */
const F = ({ label, children }: { label:string; children: React.ReactNode }) => (
  <div>
    <p style={{ fontSize:11, color:'var(--muted)', marginBottom:5, fontWeight:500 }}>{label}</p>
    {children}
  </div>
)

/* ─── Section Header ─── */
const SH = ({ icon, title, onAdd }: { icon:string; title:string; onAdd?:()=>void }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:10, borderBottom:'1px solid var(--border)', marginBottom:14 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:26, height:26, borderRadius:6, background:'var(--blue-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className={`ti ${icon}`} style={{ color:'var(--blue)', fontSize:13 }} />
      </div>
      <span style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{title}</span>
    </div>
    {onAdd && (
      <button onClick={onAdd} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', color:'var(--blue)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit' }}
        onMouseEnter={e=>(e.currentTarget.style.background='var(--blue-dim)')}
        onMouseLeave={e=>(e.currentTarget.style.background='none')}>
        <i className="ti ti-plus" style={{ fontSize:12 }} />Add
      </button>
    )}
  </div>
)

/* ─── Empty State ─── */
const AddEmpty = ({ label, onClick }: { label:string; onClick:()=>void }) => (
  <button onClick={onClick} style={{ width:'100%', padding:'14px', border:'2px dashed var(--border)', borderRadius:10, background:'none', color:'var(--muted)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', transition:'all 0.15s' }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.color='var(--blue)'}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)'}}>
    <i className="ti ti-plus" style={{ fontSize:15 }} />{label}
  </button>
)

/* ─── Input ─── */
const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontFamily:'inherit', fontSize:13, padding:'8px 11px', outline:'none', ...props.style }} onFocus={e=>{e.currentTarget.style.borderColor='var(--blue)'}} onBlur={e=>{e.currentTarget.style.borderColor='var(--border)'}} />
)
const TA = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontFamily:'inherit', fontSize:13, padding:'8px 11px', outline:'none', resize:'vertical', minHeight:72, ...props.style }} onFocus={e=>{e.currentTarget.style.borderColor='var(--blue)'}} onBlur={e=>{e.currentTarget.style.borderColor='var(--border)'}} />
)

/* ─── Sub-rows ─── */
const ExpRow = ({ e, onUpdate, onRemove }: { e:ExpEntry; onUpdate:(v:ExpEntry)=>void; onRemove:()=>void }) => (
  <div className="surface-2" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      <Inp value={e.title}   onChange={x=>onUpdate({...e,title:x.target.value})}   placeholder="Job Title" />
      <Inp value={e.company} onChange={x=>onUpdate({...e,company:x.target.value})} placeholder="Company" />
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, alignItems:'center' }}>
      <Inp value={e.start_date} onChange={x=>onUpdate({...e,start_date:x.target.value})} placeholder="Start (2021)" />
      <Inp value={e.end_date}   onChange={x=>onUpdate({...e,end_date:x.target.value})}   placeholder="End or Present" disabled={e.is_current} />
      <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--muted)', cursor:'pointer' }}>
        <input type="checkbox" checked={e.is_current} style={{ accentColor:'var(--blue)', width:14, height:14 }}
          onChange={x=>onUpdate({...e,is_current:x.target.checked,end_date:x.target.checked?'Present':''})} />
        Current role
      </label>
    </div>
    <TA value={e.description} onChange={x=>onUpdate({...e,description:x.target.value})} placeholder="What did you build / achieve? Quantify impact (e.g. reduced latency by 40%)" />
    <button onClick={onRemove} style={{ alignSelf:'flex-start', background:'var(--red-dim)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, color:'var(--red)', fontSize:11, padding:'3px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit' }}>
      <i className="ti ti-trash" style={{ fontSize:11 }} />Remove
    </button>
  </div>
)

const EduRow = ({ e, onUpdate, onRemove }: { e:EduEntry; onUpdate:(v:EduEntry)=>void; onRemove:()=>void }) => (
  <div className="surface-2" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      <Inp value={e.degree}        onChange={x=>onUpdate({...e,degree:x.target.value})}        placeholder="Degree (B.Tech, M.Sc…)" />
      <Inp value={e.field_of_study} onChange={x=>onUpdate({...e,field_of_study:x.target.value})} placeholder="Field (Computer Science…)" />
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8 }}>
      <Inp value={e.institution} onChange={x=>onUpdate({...e,institution:x.target.value})} placeholder="University / College" />
      <Inp value={e.cgpa}        onChange={x=>onUpdate({...e,cgpa:x.target.value})}        placeholder="CGPA / %" />
      <Inp value={e.start_year}  onChange={x=>onUpdate({...e,start_year:x.target.value})}  placeholder="Start" />
      <Inp value={e.end_year}    onChange={x=>onUpdate({...e,end_year:x.target.value})}    placeholder="End" />
    </div>
    <button onClick={onRemove} style={{ alignSelf:'flex-start', background:'var(--red-dim)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, color:'var(--red)', fontSize:11, padding:'3px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit' }}>
      <i className="ti ti-trash" style={{ fontSize:11 }} />Remove
    </button>
  </div>
)

const ProjRow = ({ p, onUpdate, onRemove }: { p:ProjEntry; onUpdate:(v:ProjEntry)=>void; onRemove:()=>void }) => (
  <div className="surface-2" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      <Inp value={p.name} onChange={x=>onUpdate({...p,name:x.target.value})} placeholder="Project Name" />
      <Inp value={p.url}  onChange={x=>onUpdate({...p,url:x.target.value})}  placeholder="GitHub / Live URL" />
    </div>
    <Inp value={p.tech_stack} onChange={x=>onUpdate({...p,tech_stack:x.target.value})} placeholder="Tech stack: React, Python, FastAPI, Docker… (comma separated)" />
    <TA value={p.description} onChange={x=>onUpdate({...p,description:x.target.value})} placeholder="What it does, why you built it, impact…" />
    <button onClick={onRemove} style={{ alignSelf:'flex-start', background:'var(--red-dim)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, color:'var(--red)', fontSize:11, padding:'3px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit' }}>
      <i className="ti ti-trash" style={{ fontSize:11 }} />Remove
    </button>
  </div>
)

/* ─── Pool Card ─── */
const PoolCard = ({ c, i }: { c:any; i:number }) => (
  <div className="surface anim-up" style={{ padding:'14px 16px', animationDelay:`${i*0.04}s`, transition:'border-color 0.15s, background 0.15s' }}
    onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor='rgba(79,142,247,0.3)';el.style.background='var(--bg2)'}}
    onMouseLeave={e=>{const el=e.currentTarget;el.style.borderColor='var(--border)';el.style.background='var(--bg1)'}}>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:3 }}>{c.name||`Candidate ${i+1}`}</p>
        <p style={{ fontSize:12, color:'var(--blue)' }}>{c.ai_role_label||c.current_title||'Open to opportunities'}</p>
      </div>
      {c.years_of_experience > 0 && (
        <span style={{ fontSize:11, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px', color:'var(--muted)', fontFamily:'JetBrains Mono' }}>{c.years_of_experience}y</span>
      )}
    </div>
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
      {(c.skills||[]).slice(0,6).map((s:string)=><SkillPill key={s} skill={s} variant="neutral" />)}
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:11, color:'var(--muted)' }}>
      {c.location && <span><i className="ti ti-map-pin" style={{ marginRight:3 }} />{c.location}</span>}
      {c.github_url && <a href={c.github_url} target="_blank" rel="noreferrer" style={{ color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-brand-github" />GitHub</a>}
      {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" style={{ color:'var(--blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}><i className="ti ti-brand-linkedin" />LinkedIn</a>}
    </div>
  </div>
)

/* ─── MAIN PAGE ─── */
export default function CandidatePortal() {
  const [tab, setTab] = useState<'create'|'pool'|'optimizer'>('create')
  const [experience, setExperience] = useState<ExpEntry[]>([])
  const [education, setEducation] = useState<EduEntry[]>([])
  const [projects, setProjects] = useState<ProjEntry[]>([])
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState:{errors} } = useForm<FD>({ resolver: zodResolver(schema) })

  const { data: pool, isLoading: poolLoading } = useQuery({ queryKey:['pool'], queryFn:()=>getOpenPool(), enabled:tab==='pool' })

  const mut = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => { setDone(true); toast.success('Profile added to talent pool!') },
    onError: (e:any) => toast.error(e?.response?.data?.detail||'Submission failed'),
  })

  const onSubmit = (data: FD) => {
    mut.mutate({
      ...data,
      skills: data.skills ? data.skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
      work_experience: experience.map(e=>({...e})),
      education: education.map(e=>({...e, start_year:e.start_year?+e.start_year:null, end_year:e.end_year?+e.end_year:null, cgpa:e.cgpa?+e.cgpa:null})),
      projects: projects.map(p=>({...p, tech_stack:p.tech_stack.split(',').map(s=>s.trim()).filter(Boolean)})),
    })
  }

  const addExp  = () => setExperience(p=>[...p,{title:'',company:'',start_date:'',end_date:'',description:'',is_current:false}])
  const addEdu  = () => setEducation(p=>[...p,{degree:'',field_of_study:'',institution:'',start_year:'',end_year:'',cgpa:''}])
  const addProj = () => setProjects(p=>[...p,{name:'',description:'',tech_stack:'',url:''}])

  const tabStyle = (active:boolean): React.CSSProperties => ({ padding:'7px 20px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all 0.15s', background: active?'var(--blue)':'transparent', color: active?'#fff':'var(--muted)' })

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'28px 24px' }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:2, padding:4, background:'var(--bg2)', borderRadius:10, border:'1px solid var(--border)', width:'fit-content', marginBottom:28 }}>
        <button style={tabStyle(tab==='create')} onClick={()=>setTab('create' as any)}>
          <i className="ti ti-user-circle" style={{ marginRight:6 }} />Build Profile
        </button>
        <button style={tabStyle(tab==='pool')} onClick={()=>setTab('pool' as any)}>
          <i className="ti ti-users" style={{ marginRight:6 }} />Talent Pool
        </button>
        <button style={tabStyle(tab==='optimizer')} onClick={()=>setTab('optimizer' as any)}>
          <i className="ti ti-wand" style={{ marginRight:6 }} />ATS Optimizer
        </button>
      </div>

      {/* ── CREATE ── */}
      {tab === 'create' && (
        <div className="anim-in">
          {done ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, padding:'60px 0', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--green-dim)', border:'1px solid rgba(52,211,153,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="ti ti-circle-check" style={{ fontSize:36, color:'var(--green)' }} />
              </div>
              <div>
                <h2 style={{ fontSize:24, fontWeight:700, color:'var(--text)', marginBottom:8 }}>You're in the pool!</h2>
                <p style={{ color:'var(--muted)', lineHeight:1.6 }}>Your profile is indexed and visible to recruiters.<br/>You'll appear when your skills match open roles.</p>
              </div>
              <button onClick={()=>{setDone(false);setTab('pool')}} style={{ padding:'10px 24px', background:'var(--blue)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
                <i className="ti ti-users" />View Talent Pool →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:28 }}>

              {/* Basic Info */}
              <section>
                <SH icon="ti-user" title="Basic Information" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <F label="Full Name *">
                    <Inp {...register('name')} placeholder="John Doe" />
                    {errors.name && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{errors.name.message}</p>}
                  </F>
                  <F label="Email *">
                    <Inp {...register('email')} type="email" placeholder="you@example.com" />
                    {errors.email && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{errors.email.message}</p>}
                  </F>
                  <F label="Current Title">
                    <Inp {...register('current_title')} placeholder="e.g. ML Engineer, Civil Engineer…" />
                  </F>
                  <F label="Current Company">
                    <Inp {...register('current_company')} placeholder="Company name" />
                  </F>
                  <F label="Headline">
                    <Inp {...register('headline')} placeholder="Short professional headline" />
                  </F>
                  <F label="Location">
                    <Inp {...register('location')} placeholder="Hyderabad, India" />
                  </F>
                  <F label="Years of Experience">
                    <Inp {...register('years_of_experience')} type="number" step="0.5" min="0" placeholder="e.g. 3.5" />
                  </F>
                </div>
                <div style={{ marginTop:10 }}>
                  <F label="Professional Summary">
                    <TA {...register('summary')} rows={3} placeholder="What makes you unique? Describe your expertise, achievements, and what you're looking for…" />
                  </F>
                </div>
              </section>

              {/* Skills */}
              <section>
                <SH icon="ti-code" title="Skills" />
                <F label="Technical Skills (comma separated)">
                  <Inp {...register('skills')} placeholder="Python, React, PyTorch, FastAPI, AutoCAD, STAAD.Pro, Docker…" />
                </F>
                <p style={{ fontSize:11, color:'var(--blue)', marginTop:8, display:'flex', alignItems:'center', gap:5 }}>
                  <i className="ti ti-sparkles" />SignalHire will automatically infer related skills via the role ontology
                </p>
              </section>

              {/* Work Experience */}
              <section>
                <SH icon="ti-briefcase" title="Work Experience" onAdd={addExp} />
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {experience.map((e,i) => (
                    <ExpRow key={i} e={e}
                      onUpdate={v=>setExperience(p=>p.map((x,j)=>j===i?v:x))}
                      onRemove={()=>setExperience(p=>p.filter((_,j)=>j!==i))} />
                  ))}
                  {experience.length===0 && <AddEmpty label="Add work experience" onClick={addExp} />}
                </div>
              </section>

              {/* Education */}
              <section>
                <SH icon="ti-school" title="Education" onAdd={addEdu} />
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {education.map((e,i) => (
                    <EduRow key={i} e={e}
                      onUpdate={v=>setEducation(p=>p.map((x,j)=>j===i?v:x))}
                      onRemove={()=>setEducation(p=>p.filter((_,j)=>j!==i))} />
                  ))}
                  {education.length===0 && <AddEmpty label="Add education" onClick={addEdu} />}
                </div>
              </section>

              {/* Projects */}
              <section>
                <SH icon="ti-topology-star" title="Projects" onAdd={addProj} />
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {projects.map((p,i) => (
                    <ProjRow key={i} p={p}
                      onUpdate={v=>setProjects(prev=>prev.map((x,j)=>j===i?v:x))}
                      onRemove={()=>setProjects(prev=>prev.filter((_,j)=>j!==i))} />
                  ))}
                  {projects.length===0 && <AddEmpty label="Add project" onClick={addProj} />}
                </div>
              </section>

              {/* Links */}
              <section>
                <SH icon="ti-link" title="Links" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[
                    { reg:'github_url' as const, icon:'ti-brand-github', ph:'github.com/username', col:'var(--text)' },
                    { reg:'linkedin_url' as const, icon:'ti-brand-linkedin', ph:'linkedin.com/in/…', col:'#0a66c2' },
                    { reg:'portfolio_url' as const, icon:'ti-world', ph:'yourportfolio.dev', col:'var(--green)' },
                  ].map(({ reg, icon, ph, col }) => (
                    <div key={reg} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 11px' }}>
                      <i className={`ti ${icon}`} style={{ color:col, fontSize:15, flexShrink:0 }} />
                      <input {...register(reg)} placeholder={ph} style={{ flex:1, background:'transparent', border:'none', color:'var(--text)', fontFamily:'inherit', fontSize:13, outline:'none' }} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Submit */}
              <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:16, borderTop:'1px solid var(--border)' }}>
                <button type="submit" disabled={mut.isPending} style={{ padding:'11px 32px', background: mut.isPending?'var(--bg2)':'var(--blue)', border:'none', borderRadius:10, color: mut.isPending?'var(--muted)':'#fff', fontSize:14, fontWeight:600, cursor: mut.isPending?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, boxShadow: mut.isPending?'none':'0 0 24px rgba(79,142,247,0.3)', transition:'all 0.2s' }}>
                  {mut.isPending
                    ? <><i className="ti ti-loader spin" style={{ fontSize:16 }} />Indexing profile…</>
                    : <><i className="ti ti-sparkles" style={{ fontSize:16 }} />Submit to Talent Pool</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── POOL ── */}
      {tab === 'pool' && (
        <div className="anim-in">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Open Talent Pool</h2>
              <p style={{ fontSize:13, color:'var(--muted)' }}>{pool?.total ?? 0} candidates available for discovery</p>
            </div>
            <button onClick={()=>setTab('create')} style={{ padding:'8px 16px', background:'var(--blue)', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
              <i className="ti ti-plus" />Add Profile
            </button>
          </div>

          {poolLoading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:'var(--muted)', gap:10 }}>
              <i className="ti ti-loader spin" style={{ fontSize:20 }} />Loading pool…
            </div>
          ) : (
            <div className="stagger" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {(pool?.candidates??[]).map((c:any,i:number) => <PoolCard key={c.candidate_id||i} c={c} i={i} />)}
              {(pool?.candidates??[]).length === 0 && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'var(--muted)' }}>
                  <i className="ti ti-users" style={{ fontSize:32, display:'block', marginBottom:12 }} />
                  <p>No candidates yet.</p>
                  <button onClick={()=>setTab('create')} style={{ marginTop:12, background:'none', border:'none', color:'var(--blue)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Be the first →</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── OPTIMIZER ── */}
      {tab === 'optimizer' && <ATSOptimizer />}
    </div>
  )
}
