import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Directory() {
  const [faculty, setFaculty] = useState([])
  const [dept, setDept] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.list().then(d => { setFaculty(d); setLoading(false) }) }, [])

  const depts = useMemo(() => ['All', ...new Set(faculty.map(f => f.department).filter(Boolean))], [faculty])

  const shown = useMemo(() => {
    const list = dept === 'All' ? faculty : faculty.filter(f => f.department === dept)
    return list.slice().sort((a, b) => firstName(a.name).localeCompare(firstName(b.name)))
  }, [faculty, dept])

  const grouped = useMemo(() => {
    const g = {}
    for (const f of shown) {
     const L = firstName(f.name)[0]?.toUpperCase() || '?'
      ;(g[L] ||= []).push(f)
    }
    return g
  }, [shown])

  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
      <div className="eyebrow mb-3">Scholarly Directory</div>
      <h1 className="display text-5xl md:text-6xl font-semibold leading-tight mb-10">
        School of Computer and<br/>Information Sciences
      </h1>

      <div className="flex gap-6 border-b hairline mb-12 overflow-x-auto">
        {depts.map(d => (
          <button key={d} onClick={() => setDept(d)}
            className={`py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition ${
              dept === d ? 'border-maroon text-maroon font-medium' : 'border-transparent text-ink/60 hover:text-ink'
            }`}>
            {d === 'All' ? 'All Faculty' : d}
          </button>
        ))}
      </div>

      {loading && <p className="text-ink/50">Loading…</p>}

      {Object.entries(grouped).map(([letter, items]) => (
        <section key={letter} className="mb-16">
          <h2 className="display text-5xl text-ink/15 font-light mb-6">{letter}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {items.map(f => <FacultyCard key={f.id} f={f} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function FacultyCard({ f }) {
  return (
    <Link to={`/faculty/${f.id}`} className="group">
      <div className="aspect-[4/5] bg-ink/5 overflow-hidden mb-4">
        {f.photo_url
          ? <img src={f.photo_url} alt={f.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-ink/20 display text-6xl">{initials(f.name)}</div>
        }
      </div>
      <div className="eyebrow mb-1">{f.title || 'Faculty'}</div>
      <h3 className="display text-xl font-semibold mb-1 group-hover:text-maroon transition">{f.name}</h3>
      <p className="text-sm text-ink/60 line-clamp-2">{(f.research_areas || []).join(' · ')}</p>
      <span className="text-xs text-maroon mt-2 inline-block">View Research Profile →</span>
    </Link>
  )
}

function firstName(fullname) {
  return (fullname || '').replace(/^(Dr\.|Prof\.|Professor)\s*/i, '').trim().split(/\s+/)[0] || ''
}
function initials(name) {
  return (name || '').replace(/^(Dr\.|Prof\.)\s+/i, '').split(' ').map(s => s[0]).slice(0,2).join('')
}