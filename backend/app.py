import os
from datetime import timedelta
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from models import db, Faculty, Publication, Course, ResearchGroup, MediaMention, User, Award
import json
from cv_parser import parse_cv

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///faculty.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'dev-secret-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# CORS with credentials for session cookies
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
bcrypt = Bcrypt(app)
db.init_app(app)

with app.app_context():
    db.create_all()


# ---------- Auth helpers ----------

def current_user():
    uid = session.get('user_id')
    return User.query.get(uid) if uid else None


def login_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user():
            return jsonify({'error': 'authentication required'}), 401
        return fn(*args, **kwargs)
    return wrapper


def owns_faculty(faculty_id):
    """True if logged-in user owns the given faculty profile."""
    u = current_user()
    return u is not None and u.faculty_id == faculty_id


# ---------- Auth routes ----------

@app.post('/api/auth/signup')
def signup():
    """
    Faculty signup: email must match an existing Faculty record that has no User yet.
    Admin (seeder) pre-creates Faculty entries; faculty claim theirs by signing up.
    """
    data = request.json or {}
    email = (data.get('email') or '').lower().strip()
    password = data.get('password') or ''

    if not email or len(password) < 8:
        return jsonify({'error': 'email required, password must be 8+ characters'}), 400

    # Find matching faculty by email
    faculty = Faculty.query.filter(db.func.lower(Faculty.email) == email).first()
    if not faculty:
        return jsonify({'error': 'no faculty account found for this email. Contact administrator.'}), 404

    # Check no existing user for this faculty
    if User.query.filter_by(faculty_id=faculty.id).first():
        return jsonify({'error': 'an account already exists for this faculty. Please login instead.'}), 409

    # Check email not taken by someone else
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'this email is already registered.'}), 409

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password_hash=pw_hash, faculty_id=faculty.id)
    db.session.add(user); db.session.commit()

    session.permanent = True
    session['user_id'] = user.id
    return jsonify({'user': user.to_dict(), 'faculty': faculty.to_dict(full=True)})


@app.post('/api/auth/login')
def login():
    data = request.json or {}
    email = (data.get('email') or '').lower().strip()
    password = data.get('password') or ''

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'invalid email or password'}), 401

    session.permanent = True
    session['user_id'] = user.id
    return jsonify({'user': user.to_dict(), 'faculty': user.faculty.to_dict(full=True)})


@app.post('/api/auth/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'ok': True})


@app.get('/api/auth/me')
def me():
    u = current_user()
    if not u:
        return jsonify({'user': None})
    return jsonify({'user': u.to_dict(), 'faculty': u.faculty.to_dict(full=True)})


# ---------- Public faculty endpoints (unchanged — anyone can view) ----------

@app.get('/api/faculty')
def list_faculty():
    dept = request.args.get('department')
    q = Faculty.query
    if dept:
        q = q.filter_by(department=dept)
    return jsonify([f.to_dict() for f in q.order_by(Faculty.name).all()])


@app.get('/api/faculty/<int:fid>')
def get_faculty(fid):
    f = Faculty.query.get_or_404(fid)
    return jsonify(f.to_dict(full=True))


# ---------- Protected editing endpoints (faculty can only edit their own) ----------

@app.put('/api/faculty/<int:fid>')
@login_required
def update_faculty(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'you can only edit your own profile'}), 403
    f = Faculty.query.get_or_404(fid)
    data = request.json or {}
    for k, v in data.items():
        if hasattr(Faculty, k) and not isinstance(v, list):
            setattr(f, k, v)
    db.session.commit()
    return jsonify(f.to_dict(full=True))


@app.post('/api/faculty/<int:fid>/publications')
@login_required
def add_publication(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    Faculty.query.get_or_404(fid)
    p = Publication(faculty_id=fid, **(request.json or {}))
    db.session.add(p); db.session.commit()
    return jsonify(p.to_dict()), 201


@app.delete('/api/publications/<int:pid>')
@login_required
def del_publication(pid):
    p = Publication.query.get_or_404(pid)
    if not owns_faculty(p.faculty_id):
        return jsonify({'error': 'forbidden'}), 403
    db.session.delete(p); db.session.commit()
    return '', 204


@app.post('/api/faculty/<int:fid>/courses')
@login_required
def add_course(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    Faculty.query.get_or_404(fid)
    c = Course(faculty_id=fid, **(request.json or {}))
    db.session.add(c); db.session.commit()
    return jsonify(c.to_dict()), 201


@app.delete('/api/courses/<int:cid>')
@login_required
def del_course(cid):
    c = Course.query.get_or_404(cid)
    if not owns_faculty(c.faculty_id):
        return jsonify({'error': 'forbidden'}), 403
    db.session.delete(c); db.session.commit()
    return '', 204


@app.post('/api/faculty/<int:fid>/cv')
@login_required
def upload_cv(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    f = Faculty.query.get_or_404(fid)
    if 'file' not in request.files:
        return jsonify({'error': 'no file'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'pdf only'}), 400
    filename = secure_filename(f'faculty_{fid}_{file.filename}')
    path = os.path.join(UPLOAD_DIR, filename)
    file.save(path)
    f.cv_file_url = f'/uploads/{filename}'
    db.session.commit()
    return jsonify({'cv_file_url': f.cv_file_url})

@app.post('/api/faculty/<int:fid>/photo')
@login_required
def upload_photo(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    f = Faculty.query.get_or_404(fid)
    if 'file' not in request.files:
        return jsonify({'error': 'no file'}), 400
    file = request.files['file']
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in {'jpg', 'jpeg', 'png', 'webp'}:
        return jsonify({'error': 'only jpg/png/webp images allowed'}), 400
    filename = secure_filename(f'photo_{fid}.{ext}')
    path = os.path.join(UPLOAD_DIR, filename)
    file.save(path)
    f.photo_url = f'/uploads/{filename}'
    db.session.commit()
    return jsonify({'photo_url': f.photo_url})

@app.post('/api/faculty/<int:fid>/parse-cv')
@login_required
def parse_cv_endpoint(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    f = Faculty.query.get_or_404(fid)
    if 'file' not in request.files:
        return jsonify({'error': 'no file'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'pdf only'}), 400
    filename = secure_filename(f'faculty_{fid}_{file.filename}')
    path = os.path.join(UPLOAD_DIR, filename)
    file.save(path)
    f.cv_file_url = f'/uploads/{filename}'
    db.session.commit()
    parsed = parse_cv(path)
    parsed['cv_file_url'] = f.cv_file_url
    return jsonify(parsed)


@app.get('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.post('/api/faculty/<int:fid>/awards')
@login_required
def add_award(fid):
    if not owns_faculty(fid):
        return jsonify({'error': 'forbidden'}), 403
    Faculty.query.get_or_404(fid)
    data = request.json or {}
    if 'media_links' in data and isinstance(data['media_links'], list):
        data['media_links'] = json.dumps(data['media_links'])
    a = Award(faculty_id=fid, **data)
    db.session.add(a); db.session.commit()
    return jsonify(a.to_dict()), 201


@app.put('/api/awards/<int:aid>')
@login_required
def update_award(aid):
    a = Award.query.get_or_404(aid)
    if not owns_faculty(a.faculty_id):
        return jsonify({'error': 'forbidden'}), 403
    data = request.json or {}
    if 'media_links' in data and isinstance(data['media_links'], list):
        data['media_links'] = json.dumps(data['media_links'])
    for k, v in data.items():
        if hasattr(Award, k):
            setattr(a, k, v)
    db.session.commit()
    return jsonify(a.to_dict())


@app.delete('/api/awards/<int:aid>')
@login_required
def del_award(aid):
    a = Award.query.get_or_404(aid)
    if not owns_faculty(a.faculty_id):
        return jsonify({'error': 'forbidden'}), 403
    db.session.delete(a); db.session.commit()
    return '', 204


if __name__ == '__main__':
    app.run(debug=True, port=5000)