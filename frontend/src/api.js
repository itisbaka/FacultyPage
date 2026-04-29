const base = '';
const opts = { credentials: 'include' };  // always send session cookies

const json = (method, body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  // Auth
  me: () => fetch(`${base}/api/auth/me`, opts).then(r => r.json()),
  signup: (email, password) => fetch(`${base}/api/auth/signup`, json('POST', {email, password})).then(r => r.json()),
  login: (email, password) => fetch(`${base}/api/auth/login`, json('POST', {email, password})).then(r => r.json()),
  logout: () => fetch(`${base}/api/auth/logout`, { method: 'POST', credentials: 'include' }).then(r => r.json()),

  // Public
  list: (dept) => fetch(`${base}/api/faculty${dept ? `?department=${dept}` : ''}`, opts).then(r => r.json()),
  get: (id) => fetch(`${base}/api/faculty/${id}`, opts).then(r => r.json()),

  // Protected (server enforces ownership)
  update: (id, body) => fetch(`${base}/api/faculty/${id}`, json('PUT', body)).then(r => r.json()),
  addPub: (id, body) => fetch(`${base}/api/faculty/${id}/publications`, json('POST', body)).then(r => r.json()),
  delPub: (pid) => fetch(`${base}/api/publications/${pid}`, { method: 'DELETE', credentials: 'include' }),
  addCourse: (id, body) => fetch(`${base}/api/faculty/${id}/courses`, json('POST', body)).then(r => r.json()),
  delCourse: (cid) => fetch(`${base}/api/courses/${cid}`, { method: 'DELETE', credentials: 'include' }),
  uploadCv: (id, file) => {
    const fd = new FormData(); fd.append('file', file);
    return fetch(`${base}/api/faculty/${id}/cv`, { method: 'POST', credentials: 'include', body: fd }).then(r => r.json());
  },
  parseCv: (id, file) => {
    const fd = new FormData(); fd.append('file', file);
    return fetch(`${base}/api/faculty/${id}/parse-cv`, { method: 'POST', credentials: 'include', body: fd }).then(r => r.json());
  },
  uploadPhoto: (id, file) => {
  const fd = new FormData(); fd.append('file', file);
  return fetch(`${base}/api/faculty/${id}/photo`, { method: 'POST', credentials: 'include', body: fd }).then(r => r.json());
  },
  addAward: (id, body) => fetch(`${base}/api/faculty/${id}/awards`, json('POST', body)).then(r => r.json()),
  updateAward: (aid, body) => fetch(`${base}/api/awards/${aid}`, json('PUT', body)).then(r => r.json()),
  delAward: (aid) => fetch(`${base}/api/awards/${aid}`, { method: 'DELETE', credentials: 'include' }),
};