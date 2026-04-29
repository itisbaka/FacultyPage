import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

export default function EditProfile() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const nav = useNavigate()

  const [f, setF] = useState(null)
  const [msg, setMsg] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { nav('/login'); return }
    if (String(user.faculty_id) !== String(id)) { nav(`/faculty/${id}`); return }
    api.get(id).then(setF)
  }, [id, user, authLoading, nav])

  if (authLoading || !f) return <div className="max-w-4xl mx-auto px-6 py-16">Loading…</div>

  const flash = (s) => { setMsg(s); setTimeout(() => setMsg(''), 2500) }

  const save = async () => {
    await api.update(id, {
      name: f.name, title: f.title, department: f.department, email: f.email,
      office: f.office, phone: f.phone, tagline: f.tagline, bio: f.bio,
      research_trajectory: f.research_trajectory, personal_website_url: f.personal_website_url,
      google_scholar_url: f.google_scholar_url,
      research_areas: Array.isArray(f.research_areas) ? f.research_areas.join(', ') : f.research_areas,
      professional_profile: f.professional_profile,
    })
    flash('Profile saved.')
  }

  const uploadCv = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const res = await api.uploadCv(id, file)
    if (res.cv_file_url) { setF({ ...f, cv_file_url: res.cv_file_url }); flash('CV uploaded.') }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const res = await api.uploadPhoto(id, file)
    if (res.photo_url) { setF({ ...f, photo_url: res.photo_url }); flash('Photo updated.') }
    else if (res.error) flash(`Error: ${res.error}`)
  }
    
  const parseAndFill = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setParsing(true); setParseResult(null)
    try {
      const r = await api.parseCv(id, file)
      if (r.error) { flash(`Error: ${r.error}`); return }
      const merged = { ...f, cv_file_url: r.cv_file_url }
      const scalarFields = ['name','title','department','email','phone','office','tagline','bio','personal_website_url']
      let filledCount = 0
      for (const k of scalarFields) {
        if (r[k] && !merged[k]) { merged[k] = r[k]; filledCount++ }
      }
      if (r.research_areas?.length && !merged.research_areas?.length) {
        merged.research_areas = r.research_areas; filledCount++
      }
      const existing = new Set((merged.publications || []).map(p => p.title.toLowerCase()))
      merged._parsedPubsPreview = (r.publications || []).filter(p => p.title && !existing.has(p.title.toLowerCase()))
      // Awards: parsed awards are added to a preview, faculty confirms each
      const existingAwardTitles = new Set((merged.awards || []).map(a => a.title.toLowerCase()))
      merged._parsedAwardsPreview = (r.awards || []).filter(a => a.title && !existingAwardTitles.has(a.title.toLowerCase()))

      // Markdown profile — fills only if empty
      if (r.professional_profile && !merged.professional_profile) {
        merged.professional_profile = r.professional_profile
        filledCount++
      }
     setF(merged)
     setParseResult({ strategy: r._strategy || 'unknown',filledCount,pubsCount: merged._parsedPubsPreview.length,awardsCount: merged._parsedAwardsPreview.length,
     })
    } finally { setParsing(false) }
  }

  const addParsedPub = async (p, idx) => {
    const saved = await api.addPub(id, p)
    setF(prev => ({
      ...prev,
      publications: [...(prev.publications || []), saved],
      _parsedPubsPreview: prev._parsedPubsPreview.filter((_, j) => j !== idx),
    }))
  }
  const skipParsedPub = (idx) => setF(prev => ({ ...prev, _parsedPubsPreview: prev._parsedPubsPreview.filter((_, j) => j !== idx) }))
  const addParsedAward = async (a, idx) => {
  const saved = await api.addAward(id, a)
  setF(prev => ({
    ...prev,
    awards: [...(prev.awards || []), saved],
    _parsedAwardsPreview: prev._parsedAwardsPreview.filter((_, j) => j !== idx),
  }))
}
const skipParsedAward = (idx) => setF(prev => ({
  ...prev, _parsedAwardsPreview: prev._parsedAwardsPreview.filter((_, j) => j !== idx)
}))
  const delPub = async (pid) => { await api.delPub(pid); setF({ ...f, publications: f.publications.filter(p => p.id !== pid) }) }
  const delCourse = async (cid) => { await api.delCourse(cid); setF({ ...f, courses: f.courses.filter(c => c.id !== cid) }) }

  const addPubFromForm = async (payload) => {
    if ((f.publications?.length || 0) >= 5) {
      flash('Maximum 5 publications. Remove one first or use your Scholar link.')
      return false
    }
    const p = await api.addPub(id, payload)
    setF({ ...f, publications: [...(f.publications || []), p] })
    flash('Publication added.')
    return true
  }

  const addCourseFromForm = async (payload) => {
    const c = await api.addCourse(id, payload)
    setF({ ...f, courses: [...(f.courses || []), c] })
    flash('Course added.')
    return true
  }
  const delAward = async (aid) => {
  await api.delAward(aid)
  setF({ ...f, awards: f.awards.filter(a => a.id !== aid) })
}

const addAwardFromForm = async (payload) => {
  const a = await api.addAward(id, payload)
  setF({ ...f, awards: [...(f.awards || []), a] })
  flash('Award added.')
  return true
}

  const raStr = Array.isArray(f.research_areas) ? f.research_areas.join(', ') : (f.research_areas || '')

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-24">
      <Link to={`/faculty/${id}`} className="text-sm text-ink/50 hover:text-maroon">← Back to profile</Link>
      <h1 className="display text-4xl font-semibold mt-4 mb-2">Edit Profile</h1>
      <p className="text-sm text-ink/60 mb-8">Changes save individually for lists (publications, courses) and via the Save button for profile fields.</p>

      {msg && <div className="fixed top-6 right-6 z-50 px-4 py-2 bg-maroon text-white text-sm shadow-lg">{msg}</div>}

      {/* ----- Photo ----- */}
      <Card title="Profile Photo">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-ink/5 overflow-hidden flex-shrink-0">
            {f.photo_url
              ? <img src={f.photo_url} alt="Current" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">No photo</div>}
          </div>
          <div className="flex-1">
            <label className="inline-block">
              <span className="bg-maroon text-white text-sm px-4 py-2 cursor-pointer hover:bg-maroon-dark inline-block">Upload new photo</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="hidden" />
            </label>
            <p className="text-xs text-ink/50 mt-2">JPG, PNG, or WebP. Square images work best. Max 10MB.</p>
          </div>
        </div>
      </Card>

      {/* ----- CV parse ----- */}
      <Card title="CV — Parse &amp; Auto-fill">
        <div className="space-y-3">
          <label className="inline-block">
            <span className={`text-sm px-4 py-2 cursor-pointer inline-block ${parsing ? 'bg-ink/10 text-ink/40' : 'border border-maroon text-maroon hover:bg-maroon hover:text-white'}`}>
              {parsing ? 'Parsing…' : 'Upload CV (PDF)'}
            </span>
            <input type="file" accept=".pdf" onChange={parseAndFill} disabled={parsing} className="hidden" />
          </label>
          {f.cv_file_url && <a href={f.cv_file_url} target="_blank" rel="noreferrer" className="text-xs text-maroon hover:underline ml-4">View current CV ↗</a>}
          <p className="text-xs text-ink/50 leading-relaxed">
            Upload your CV to auto-fill the form below. Review and correct anything, then save. Nothing is saved until you click <strong>Save profile</strong>.
          </p>
         {parseResult && (
  <div className="text-xs bg-maroon/5 text-maroon px-3 py-2 border border-maroon/20">
    Parsed with <strong>{parseResult.strategy}</strong>. Filled {parseResult.filledCount} field(s)
    {parseResult.pubsCount > 0 && `, found ${parseResult.pubsCount} publication(s)`}
    {parseResult.awardsCount > 0 && `, found ${parseResult.awardsCount} award(s)`}
    {' '}to review below.
  </div>
)}
        </div>
      </Card>

      {f._parsedPubsPreview?.length > 0 && (
        <div className="mt-6 border border-maroon/30 bg-maroon/5 p-5">
          <div className="eyebrow mb-3">Parsed publications · review before adding</div>
          <ul className="space-y-3">
            {f._parsedPubsPreview.map((p, i) => (
              <li key={i} className="flex items-start justify-between gap-4 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-ink/50">{[p.authors, p.venue, p.year].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button onClick={() => addParsedPub(p, i)} className="text-xs text-maroon hover:underline">Add</button>
                  <button onClick={() => skipParsedPub(i)} className="text-xs text-ink/40 hover:text-ink">Skip</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {f._parsedAwardsPreview?.length > 0 && (
  <div className="mt-6 border border-maroon/30 bg-maroon/5 p-5">
    <div className="eyebrow mb-3">Parsed awards · review before adding</div>
    <ul className="space-y-3">
      {f._parsedAwardsPreview.map((a, i) => (
        <li key={i} className="flex items-start justify-between gap-4 text-sm">
          <div className="flex-1">
            <p className="font-medium">{a.title}{a.year && <span className="text-ink/50"> · {a.year}</span>}</p>
            {a.awarding_body && <p className="text-xs text-ink/50">{a.awarding_body}</p>}
            {a.description && <p className="text-xs text-ink/60 mt-1 line-clamp-2">{a.description}</p>}
            {a.media_links?.length > 0 && (
              <p className="text-xs text-maroon/70 mt-1">{a.media_links.length} media link(s) included</p>
            )}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => addParsedAward(a, i)} className="text-xs text-maroon hover:underline">Add</button>
            <button onClick={() => skipParsedAward(i)} className="text-xs text-ink/40 hover:text-ink">Skip</button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}

      {/* ----- Profile fields ----- */}
      <Card title="Basic Information">
        <div className="space-y-4">
          <Row label="Name"><Input value={f.name||''} onChange={v=>setF({...f,name:v})}/></Row>
          <Row label="Title"><Input value={f.title||''} onChange={v=>setF({...f,title:v})} placeholder="e.g. Associate Professor"/></Row>
          <Row label="Department"><Input value={f.department||''} onChange={v=>setF({...f,department:v})}/></Row>
          <Row label="Email"><Input type="email" value={f.email||''} onChange={v=>setF({...f,email:v})}/></Row>
          <Row label="Office"><Input value={f.office||''} onChange={v=>setF({...f,office:v})}/></Row>
          <Row label="Phone"><Input value={f.phone||''} onChange={v=>setF({...f,phone:v})}/></Row>
        </div>
      </Card>

      <Card title="Research &amp; Bio">
        <div className="space-y-4">
          <Row label="Tagline"><Input value={f.tagline||''} onChange={v=>setF({...f,tagline:v})} placeholder="One-line research focus"/></Row>
          <Row label="Research areas" hint="Comma-separated tags">
            <Input value={raStr} onChange={v=>setF({...f,research_areas:v})} placeholder="Machine Learning, Computer Vision, NLP"/>
          </Row>
          <Row label="Personal website"><Input value={f.personal_website_url||''} onChange={v=>setF({...f,personal_website_url:v})}/></Row>
          <Row label="Google Scholar URL">
            <Input value={f.google_scholar_url||''} onChange={v=>setF({...f,google_scholar_url:v})} placeholder="https://scholar.google.com/citations?user=..."/>
          </Row>
          <Row label="Research trajectory" hint="A longer paragraph describing your research direction">
            <Textarea value={f.research_trajectory||''} onChange={v=>setF({...f,research_trajectory:v})}/>
          </Row>
          <Row label="Bio" hint="2-3 sentence professional biography">
            <Textarea value={f.bio||''} onChange={v=>setF({...f,bio:v})}/>
          </Row>
          <Row label="Professional profile" hint="Markdown supported. Society memberships, projects, mentorship, editorial roles. The CV parser fills this for you.">
  <Textarea value={f.professional_profile||''} onChange={v=>setF({...f,professional_profile:v})} />
</Row>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={save} className="bg-maroon text-white px-6 py-2 hover:bg-maroon-dark transition">Save profile</button>
        </div>
      </Card>

      {/* ----- Publications ----- */}
      <Card title={`Publications (${f.publications?.length || 0} / 5)`}>
        {f.publications?.length > 0 && (
          <ul className="mb-6 divide-y hairline">
            {f.publications.map(p => (
              <li key={p.id} className="flex items-start justify-between gap-4 py-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {p.title}
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-maroon ml-2 text-xs">↗</a>}
                  </p>
                  <p className="text-xs text-ink/50">{[p.authors, p.venue, p.year].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                <button onClick={()=>delPub(p.id)} className="text-xs text-ink/40 hover:text-maroon">Remove</button>
              </li>
            ))}
          </ul>
        )}
        {(f.publications?.length || 0) < 5
          ? <PublicationForm onSubmit={addPubFromForm} />
          : <p className="text-xs text-ink/50">Maximum 5 publications reached. Remove one to add another, or link your Google Scholar profile above.</p>}
      </Card>

      {/* ----- Courses ----- */}
      <Card title={`Teaching (${f.courses?.length || 0})`}>
        {f.courses?.length > 0 && (
          <ul className="mb-6 divide-y hairline">
            {f.courses.map(c => (
              <li key={c.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-sm">
                    {c.code && <span className="text-ink/60">{c.code} — </span>}
                    {c.name}
                  </p>
                  <p className="text-xs text-ink/50">
                    {c.is_current ? <span className="text-maroon">● Currently teaching</span> : <span>Previously taught</span>}
                    {c.semester && ` · ${c.semester}`}
                  </p>
                </div>
                <button onClick={()=>delCourse(c.id)} className="text-xs text-ink/40 hover:text-maroon">Remove</button>
              </li>
            ))}
          </ul>
        )}
        <CourseForm onSubmit={addCourseFromForm} />
      </Card>

      {/* ----- Awards ----- */}
      <Card title={`Awards & Recognition (${f.awards?.length || 0})`}>
      {f.awards?.length > 0 && (
       <ul className="mb-6 divide-y hairline">
      {f.awards.map(a => (
        <li key={a.id} className="flex items-start justify-between gap-4 py-4">
          <div className="flex-1">
            <p className="font-medium text-sm">
              {a.title}
              {a.year && <span className="text-ink/50"> · {a.year}</span>}
            </p>
            {a.awarding_body && <p className="text-xs text-ink/50">{a.awarding_body}</p>}
            {a.description && <p className="text-xs text-ink/60 mt-1 line-clamp-2">{a.description}</p>}
            {a.media_links?.length > 0 && (
              <p className="text-xs text-maroon/70 mt-1">{a.media_links.length} media link(s)</p>
            )}
          </div>
          <button onClick={()=>delAward(a.id)} className="text-xs text-ink/40 hover:text-maroon">Remove</button>
        </li>
      ))}
    </ul>
  )}
    <AwardForm onSubmit={addAwardFromForm} />
    </Card>
    </div>
  )
}

/* ---------- UI helpers ---------- */

function Card({ title, children }) {
  return (
    <section className="mb-8 bg-white border hairline p-6">
      <h2 className="display text-xl font-semibold mb-5">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      <label className="col-span-12 md:col-span-4 text-sm text-ink/70 pt-2">
        {label}
        {hint && <span className="block text-xs text-ink/40 font-normal">{hint}</span>}
      </label>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border hairline bg-white px-3 py-2 text-sm focus:outline-none focus:border-maroon" />
  )
}

function Textarea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full border hairline bg-white px-3 py-2 text-sm focus:outline-none focus:border-maroon" />
  )
}

/* ---------- Publication add-form ---------- */

function PublicationForm({ onSubmit }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ title: '', year: '', url: '', venue: '', authors: '', category: '' })

  const reset = () => setForm({ title: '', year: '', url: '', venue: '', authors: '', category: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    const payload = {
      title: form.title.trim(),
      year: form.year ? parseInt(form.year, 10) || null : null,
      url: form.url.trim() || null,
      venue: form.venue.trim() || null,
      authors: form.authors.trim() || null,
      category: form.category.trim() || null,
    }
    const ok = await onSubmit(payload)
    setBusy(false)
    if (ok) { reset(); setOpen(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-sm text-maroon hover:underline">+ Add publication</button>
  )

  return (
    <form onSubmit={submit} className="border hairline p-5 bg-ink/[0.02]">
      <h3 className="eyebrow mb-4">New publication</h3>
      <div className="space-y-3">
        <Row label="Title *">
          <Input value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="Paper title (required)"/>
        </Row>
        <Row label="Year"><Input value={form.year} onChange={v=>setForm({...form,year:v})} placeholder="2024"/></Row>
        <Row label="Link" hint="DOI, arXiv, or publisher URL">
          <Input value={form.url} onChange={v=>setForm({...form,url:v})} placeholder="https://doi.org/..."/>
        </Row>
        <Row label="Venue"><Input value={form.venue} onChange={v=>setForm({...form,venue:v})} placeholder="Journal or conference"/></Row>
        <Row label="Authors"><Input value={form.authors} onChange={v=>setForm({...form,authors:v})} placeholder="Surname, F.; Surname, G."/></Row>
        <Row label="Category">
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
            className="w-full border hairline bg-white px-3 py-2 text-sm focus:outline-none focus:border-maroon">
            <option value="">— none —</option>
            <option>Journal</option>
            <option>Conference</option>
            <option>Book</option>
            <option>Workshop</option>
            <option>Preprint</option>
          </select>
        </Row>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button type="button" onClick={()=>{reset();setOpen(false)}} className="text-sm text-ink/60 hover:text-ink">Cancel</button>
        <button type="submit" disabled={busy || !form.title.trim()} className="bg-maroon text-white text-sm px-5 py-2 hover:bg-maroon-dark disabled:opacity-40">
          {busy ? 'Adding…' : 'Add publication'}
        </button>
      </div>
    </form>
  )
}

/* ---------- Course add-form ---------- */

function CourseForm({ onSubmit }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', semester: '', is_current: true })

  const reset = () => setForm({ name: '', code: '', semester: '', is_current: true })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    const ok = await onSubmit({
      name: form.name.trim(),
      code: form.code.trim() || null,
      semester: form.semester.trim() || null,
      is_current: form.is_current,
    })
    setBusy(false)
    if (ok) { reset(); setOpen(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-sm text-maroon hover:underline">+ Add course</button>
  )

  return (
    <form onSubmit={submit} className="border hairline p-5 bg-ink/[0.02]">
      <h3 className="eyebrow mb-4">New course</h3>
      <div className="space-y-3">
        <Row label="Course name *">
          <Input value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. Computer Networks"/>
        </Row>
        <Row label="Course code" hint="Optional">
          <Input value={form.code} onChange={v=>setForm({...form,code:v})} placeholder="e.g. CS 601"/>
        </Row>
        <Row label="Semester" hint="Optional">
          <Input value={form.semester} onChange={v=>setForm({...form,semester:v})} placeholder="e.g. Fall 2025"/>
        </Row>
        <Row label="Status">
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={form.is_current} onChange={()=>setForm({...form,is_current:true})}/>
              Currently teaching
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" checked={!form.is_current} onChange={()=>setForm({...form,is_current:false})}/>
              Previously taught
            </label>
          </div>
        </Row>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button type="button" onClick={()=>{reset();setOpen(false)}} className="text-sm text-ink/60 hover:text-ink">Cancel</button>
        <button type="submit" disabled={busy || !form.name.trim()} className="bg-maroon text-white text-sm px-5 py-2 hover:bg-maroon-dark disabled:opacity-40">
          {busy ? 'Adding…' : 'Add course'}
        </button>
      </div>
    </form>
  )
}

function AwardForm({ onSubmit }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    title: '', year: '', awarding_body: '', description: '',
    primary_url: '', media_links: [],
  })
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const reset = () => {
    setForm({ title: '', year: '', awarding_body: '', description: '', primary_url: '', media_links: [] })
    setLinkLabel(''); setLinkUrl('')
  }

  const addLink = () => {
    if (!linkLabel.trim() || !linkUrl.trim()) return
    setForm({ ...form, media_links: [...form.media_links, { label: linkLabel.trim(), url: linkUrl.trim() }] })
    setLinkLabel(''); setLinkUrl('')
  }

  const removeLink = (i) => setForm({ ...form, media_links: form.media_links.filter((_, j) => j !== i) })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    const ok = await onSubmit({
      title: form.title.trim(),
      year: form.year ? parseInt(form.year, 10) || null : null,
      awarding_body: form.awarding_body.trim() || null,
      description: form.description.trim() || null,
      primary_url: form.primary_url.trim() || null,
      media_links: form.media_links,
    })
    setBusy(false)
    if (ok) { reset(); setOpen(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-sm text-maroon hover:underline">+ Add award or recognition</button>
  )

  return (
    <form onSubmit={submit} className="border hairline p-5 bg-ink/[0.02]">
      <h3 className="eyebrow mb-4">New award</h3>
      <div className="space-y-3">
        <Row label="Award title *">
          <Input value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="e.g. IEEE Region 10 Outstanding Volunteer Award" />
        </Row>
        <Row label="Year"><Input value={form.year} onChange={v=>setForm({...form,year:v})} placeholder="2020" /></Row>
        <Row label="Awarding body"><Input value={form.awarding_body} onChange={v=>setForm({...form,awarding_body:v})} placeholder="e.g. IEEE Region 10" /></Row>
        <Row label="Description" hint="Brief context — what the award was for"><Textarea value={form.description} onChange={v=>setForm({...form,description:v})} /></Row>
        <Row label="Primary URL" hint="Official announcement or award page"><Input value={form.primary_url} onChange={v=>setForm({...form,primary_url:v})} placeholder="https://..." /></Row>
        <Row label="Media coverage" hint="Add links to articles or coverage of this award">
          <div className="space-y-2">
            {form.media_links.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white border hairline px-3 py-2">
                <span className="font-medium">{m.label}</span>
                <span className="text-ink/40 truncate flex-1">{m.url}</span>
                <button type="button" onClick={()=>removeLink(i)} className="text-ink/40 hover:text-maroon">×</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={linkLabel} onChange={e=>setLinkLabel(e.target.value)} placeholder="Label (e.g. NYT coverage)"
                className="flex-1 border hairline bg-white px-2 py-1 text-xs focus:outline-none focus:border-maroon" />
              <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://..."
                className="flex-1 border hairline bg-white px-2 py-1 text-xs focus:outline-none focus:border-maroon" />
              <button type="button" onClick={addLink} className="text-xs text-maroon hover:underline px-2">Add link</button>
            </div>
          </div>
        </Row>
      </div>
      <div className="flex gap-3 mt-5 justify-end">
        <button type="button" onClick={()=>{reset();setOpen(false)}} className="text-sm text-ink/60 hover:text-ink">Cancel</button>
        <button type="submit" disabled={busy || !form.title.trim()} className="bg-maroon text-white text-sm px-5 py-2 hover:bg-maroon-dark disabled:opacity-40">
          {busy ? 'Adding…' : 'Add award'}
        </button>
      </div>
    </form>
  )
}