import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'publications', label: 'Publications' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'awards', label: 'Awards' },
  { id: 'research-groups', label: 'Research Groups' },

]

export default function FacultyProfile() {
  const { id } = useParams()
  const [f, setF] = useState(null)
  const [active, setActive] = useState('overview')
  const { user } = useAuth()
  useEffect(() => { api.get(id).then(setF) }, [id])

  if (!f) return <div className="max-w-6xl mx-auto px-6 py-16 text-ink/50">Loading…</div>

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid grid-cols-12 gap-10">
      {/* Sidebar */}
      <aside className="col-span-12 md:col-span-3 md:sticky md:top-24 md:self-start">
        <div className="eyebrow mb-2">Faculty Metadata</div>
        <div className="mb-6">
          <div className="aspect-square w-32 bg-ink/5 mb-3 overflow-hidden">
            {f.photo_url && <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover grayscale" />}
          </div>
          <p className="text-xs text-ink/60">{f.department}</p>
        </div>
        <nav className="flex flex-col text-sm border-l hairline">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setActive(s.id)}
              className={`pl-4 py-2 -ml-px border-l-2 transition ${
                active === s.id ? 'border-maroon text-maroon font-medium' : 'border-transparent text-ink/60 hover:text-ink'
              }`}>
              {s.label}
            </a>
          ))}
        </nav>
        {/* <Link to={`/faculty/${f.id}/edit`} className="inline-block mt-8 text-xs text-ink/40 hover:text-maroon">Edit profile →</Link> */}
        {user && user.faculty_id === f.id && (
  <Link to={`/faculty/${f.id}/edit`} className="inline-block mt-8 text-xs text-ink/40 hover:text-maroon">Edit profile →</Link>
)}
      </aside>

      {/* Main */}
      <div className="col-span-12 md:col-span-9 space-y-16">
        {/* Hero */}
        <section id="overview" className="grid grid-cols-12 gap-8 items-end border-b hairline pb-10">
          <div className="col-span-12 md:col-span-5">
            <div className="aspect-[4/5] bg-ink/5 overflow-hidden">
              {f.photo_url && <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover grayscale" />}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="eyebrow mb-3">{f.title || 'Professor'}</div>
            <h1 className="display text-5xl md:text-6xl font-semibold leading-[1.05] mb-4">{f.name}</h1>
            {f.tagline && <p className="text-lg text-ink/70 leading-relaxed">{f.tagline}</p>}
            <div className="flex flex-wrap gap-2 mt-5">
              {(f.research_areas || []).map(t => (
                <span key={t} className="text-xs px-3 py-1 bg-maroon/5 text-maroon border border-maroon/20">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm -mt-8">
          {f.email && <InfoBlock label="Contact" value={f.email} />}
          {f.office && <InfoBlock label="Office" value={f.office} />}
          {f.personal_website_url && <InfoBlock label="Website" value={
            <a href={f.personal_website_url} className="text-maroon hover:underline" target="_blank" rel="noreferrer">Personal site →</a>
          } />}
        </section>

        {/* Research trajectory / bio */}
        {(f.research_trajectory || f.bio) && (
          <section className="grid grid-cols-12 gap-8 border-t hairline pt-10">
            <div className="col-span-12 md:col-span-4">
              <h2 className="display text-3xl font-semibold leading-tight">
                {f.research_trajectory ? 'Current Research Trajectory' : 'Biography'}
              </h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p className="text-ink/80 leading-relaxed text-[15px] whitespace-pre-line">
                {f.research_trajectory || f.bio}
              </p>
         {f.cv_file_url && user && user.faculty_id === f.id && (
         <div className="mt-6">
         <a href={f.cv_file_url} target="_blank" rel="noreferrer"
         className="inline-block text-sm bg-maroon text-white px-5 py-2 hover:bg-maroon-dark transition">
         Download CV
         </a>
         <p className="text-xs text-ink/50 mt-2">Visible only to you. Public viewers don't see this.</p>
         </div> 
         )}
            </div>
          </section>
        )}
        {f.professional_profile && (
  <section className="border-t hairline pt-10">
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-12 md:col-span-4">
        <h2 className="display text-3xl font-semibold leading-tight">Professional Profile</h2>
      </div>
      <div className="col-span-12 md:col-span-8 prose-content"
           dangerouslySetInnerHTML={{ __html: marked.parse(f.professional_profile) }} />
    </div>
  </section>
)}

        {/* Publications */}
        {f.publications?.length > 0 && (
  <section id="publications" className="border-t hairline pt-10">
    <div className="flex items-baseline justify-between mb-6">
      <h2 className="display text-3xl font-semibold">Selected Publications</h2>
      <span className="text-xs text-ink/50">Top {Math.min(5, f.publications.length)}</span>
    </div>
<ol className="space-y-4">
  {f.publications.slice(0, 5).map((p, i) => {
    const Content = (
      <>
        <div className="col-span-1 display text-3xl text-ink/25">{String(i+1).padStart(2,'0')}</div>
        <div className="col-span-11">
          {p.category && <div className="eyebrow mb-1">{p.category}</div>}
          <h3 className="font-medium leading-snug group-hover:text-maroon transition">
            {p.title}
            {p.url && <span className="text-maroon ml-2 text-xs">↗</span>}
          </h3>
          {(p.authors || p.venue || p.year) && (
            <p className="text-sm text-ink/60 mt-1">
              {[p.authors, p.venue, p.year].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </>
    )

    return (
      <li key={p.id} className="border-b hairline pb-4">
        {p.url ? (
          <a href={p.url} target="_blank" rel="noreferrer"
             className="grid grid-cols-12 gap-4 group cursor-pointer">
            {Content}
          </a>
        ) : (
          <div className="grid grid-cols-12 gap-4">{Content}</div>
        )}
      </li>
    )
  })}
</ol>
    {f.google_scholar_url && (
      <div className="mt-8 flex items-center justify-center">
        <a href={f.google_scholar_url} target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-2 text-sm border border-maroon text-maroon px-6 py-3 hover:bg-maroon hover:text-white transition">
          View full bibliography on Google Scholar
          <span>→</span>
        </a>
      </div>
    )}
  </section>
)}

        {/* Teaching */}
   {f.courses?.length > 0 && (
  <section id="teaching" className="border-t hairline pt-10">
    <h2 className="display text-3xl font-semibold mb-6">Teaching</h2>

    {(() => {
      const current = f.courses.filter(c => c.is_current)
      const past = f.courses.filter(c => !c.is_current)

      return (
        <div className="space-y-10">
          {current.length > 0 && (
            <div>
              <div className="eyebrow mb-4">Currently Teaching</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.map(c => <CourseCard key={c.id} c={c} highlight />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div className="eyebrow mb-4">Previously Taught</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {past.map(c => <CourseCard key={c.id} c={c} />)}
              </div>
            </div>
          )}
        </div>
      )
    })()}
  </section>
)}
    {f.awards?.length > 0 && (
  <section id="awards" className="border-t hairline pt-10">
    <h2 className="display text-3xl font-semibold mb-8">Awards &amp; Recognition</h2>
    <div className="space-y-10">
      {f.awards.map(a => (
        <article key={a.id} className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2">
            {a.year && <div className="display text-4xl text-maroon font-semibold leading-none">{a.year}</div>}
            {a.awarding_body && <div className="text-xs text-ink/50 mt-2">{a.awarding_body}</div>}
          </div>
          <div className="col-span-12 md:col-span-10">
            <h3 className="display text-xl font-semibold mb-2">
              {a.primary_url
                ? <a href={a.primary_url} target="_blank" rel="noreferrer" className="hover:text-maroon">
                    {a.title} <span className="text-xs text-maroon">↗</span>
                  </a>
                : a.title}
            </h3>
            {a.description && <p className="text-ink/75 leading-relaxed mb-3 text-[15px]">{a.description}</p>}
            {a.media_links?.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs items-center">
                <span className="eyebrow">In the media:</span>
                {a.media_links.map((m, i) => (
                  <a key={i} href={m.url} target="_blank" rel="noreferrer" className="text-maroon hover:underline">
                    {m.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
)}

        {/* Research Groups */}
        {f.groups?.length > 0 && (
          <section id="research-groups" className="border-t hairline pt-10">
            <h2 className="display text-3xl font-semibold mb-6">Research Groups</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f.groups.map(g => (
                <div key={g.id} className="bg-ink/[0.03] p-6">
                  <div className="eyebrow mb-2">Key Group</div>
                  <h3 className="display text-xl font-semibold mb-2">{g.name}</h3>
                  <p className="text-sm text-ink/70 leading-relaxed">{g.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="text-ink/80">{value}</div>
    </div>
  )
}
function CourseCard({ c, highlight = false }) {
  return (
    <div className={`border p-5 ${highlight ? 'border-maroon/30 bg-maroon/[0.02]' : 'hairline'}`}>
      {c.code && <div className="eyebrow mb-2">{c.code}</div>}
      <h3 className="font-medium leading-snug mb-1">{c.name}</h3>
      {c.semester && <p className="text-xs text-ink/50">{c.semester}</p>}
    </div>
  )
}