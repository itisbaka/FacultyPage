from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Faculty(db.Model):
    __tablename__ = 'faculty'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    title = db.Column(db.String(120))              # e.g. "Professor of Civil Engineering"
    department = db.Column(db.String(120))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(40))
    office = db.Column(db.String(120))
    photo_url = db.Column(db.String(300))
    bio = db.Column(db.Text)
    research_trajectory = db.Column(db.Text)
    professional_profile = db.Column(db.Text)  
    tagline = db.Column(db.String(300))            # short pull-quote / intro line
    cv_file_url = db.Column(db.String(300))
    personal_website_url = db.Column(db.String(300))
    google_scholar_url = db.Column(db.String(400))
    dblp_url = db.Column(db.String(400)) 
    research_areas = db.Column(db.String(400))     # comma-separated tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    publications = db.relationship('Publication', backref='faculty', cascade='all, delete-orphan')
    courses = db.relationship('Course', backref='faculty', cascade='all, delete-orphan')
    groups = db.relationship('ResearchGroup', backref='faculty', cascade='all, delete-orphan')
    media = db.relationship('MediaMention', backref='faculty', cascade='all, delete-orphan')
    awards = db.relationship('Award', backref='faculty', cascade='all, delete-orphan')
    def to_dict(self, full=True):
        data = {
            'id': self.id,
            'name': self.name,
            'title': self.title,
            'department': self.department,
            'photo_url': self.photo_url,
            'google_scholar_url': self.google_scholar_url,
            'dblp_url': self.dblp_url,
            'research_areas': [t.strip() for t in (self.research_areas or '').split(',') if t.strip()],
            'awards': [a.to_dict() for a in self.awards],
            'professional_profile': self.professional_profile,
        }
        if full:
            data.update({
                'email': self.email,
                'phone': self.phone,
                'office': self.office,
                'bio': self.bio,
                'research_trajectory': self.research_trajectory,
                'tagline': self.tagline,
                'cv_file_url': self.cv_file_url,
                'personal_website_url': self.personal_website_url,
                'publications': [p.to_dict() for p in self.publications],
                'courses': [c.to_dict() for c in self.courses],
                'groups': [g.to_dict() for g in self.groups],
                'media': [m.to_dict() for m in self.media],
            })
        return data


class Publication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False)
    title = db.Column(db.String(400), nullable=False)
    venue = db.Column(db.String(200))
    year = db.Column(db.Integer)
    authors = db.Column(db.String(400))
    category = db.Column(db.String(80))
    url = db.Column(db.String(500))  # link to paper (DOI, arXiv, publisher page, Scholar link)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'venue': self.venue,
                'year': self.year, 'authors': self.authors, 'category': self.category,
                'url': self.url}

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False)
    code = db.Column(db.String(40))        # optional now
    name = db.Column(db.String(200), nullable=False)
    semester = db.Column(db.String(40))    # optional — e.g. "Fall 2025" or just "2024"
    is_current = db.Column(db.Boolean, default=False)  # True = currently teaching, False = past

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'semester': self.semester,
            'is_current': self.is_current,
        }


class ResearchGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False)
    name = db.Column(db.String(200))
    description = db.Column(db.Text)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description}


class MediaMention(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False)
    title = db.Column(db.String(300))
    publication = db.Column(db.String(120))
    url = db.Column(db.String(400))
    date = db.Column(db.String(40))

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'publication': self.publication,
                'url': self.url, 'date': self.date}
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    faculty = db.relationship('Faculty', backref=db.backref('user', uselist=False))

    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'faculty_id': self.faculty_id}

class Award(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id'), nullable=False)
    title = db.Column(db.String(300), nullable=False)
    year = db.Column(db.Integer)
    awarding_body = db.Column(db.String(200))
    description = db.Column(db.Text)
    primary_url = db.Column(db.String(500))
    media_links = db.Column(db.Text)  # JSON array of {label, url}

    def to_dict(self):
        import json
        try:
            links = json.loads(self.media_links) if self.media_links else []
        except Exception:
            links = []
        return {
            'id': self.id, 'title': self.title, 'year': self.year,
            'awarding_body': self.awarding_body, 'description': self.description,
            'primary_url': self.primary_url, 'media_links': links,
        }