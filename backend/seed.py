from app import app, db
from models import Faculty, Publication, Course, ResearchGroup, MediaMention, Award

# =============================================================================
# REAL FACULTY — FILL THESE IN
# =============================================================================
# Replace the TODO strings with actual details. Leave unused fields as ''.
# To include these in the seed, run: python seed.py --with-real
# =============================================================================

REAL_FACULTY = [
    {
        'name': 'Dr. Wilson Naik Bhukya',
        'title': 'Associate Professor',
        'department': 'SCIS',
        'email': 'rathore@uohyd.ac.in',
        'office': 'SCIS Old Building, Room E-105',
        'photo_url': '',
        'tagline': 'Designing intelligent network algorithms for scalable and efficient communication systems.',
        'bio': 'Professor at the School of Computer and Information Sciences, University of Hyderabad. His research focuses on network algorithms, wireless ad hoc networks, evolutionary computing, and software-defined networking.',
        'research_trajectory': '',
        'research_areas': 'Network security , computer networks, vision language models , explainability , medical VQA .',
        'publications': [{'title': 'A hybrid genetic algorithm for the minimum energy broadcast problem in wireless ad hoc networks', 
 'venue': 'Applied Soft Computing', 
 'year': 2011, 
 'authors': 'Alok Singh; Wilson Naik Bhukya', 
 'category': 'Journal'},{'title': 'Multi-stage multi-secret sharing scheme for hierarchical access structure', 
 'venue': '2017 International Conference on Computing, Communication and Automation (ICCCA)', 
 'year': 2017, 
 'authors': 'Abdul Basit; N Chaitanya Kumar; V. Ch. Venkaiah; Salman Abdul Moiz; Appala Naidu Tentu; Wilson Naik', 
 'category': 'Conference'},{'title': 'An Evolutionary Approach to Multi-point Relays Selection in Mobile Ad Hoc Networks', 
 'venue': 'International Conference on Pattern Recognition and Machine Intelligence (PReMI)', 
 'year': 2019, 
 'authors': 'Alok Singh; Wilson Naik Bhukya', 
 'category': 'Conference'},{'title': 'Adaptive network-wide superspreader detection using programmable switches', 
 'venue': 'AEU - International Journal of Electronics and Communications', 
 'year': 2025, 
 'authors': 'Ali Nadim Alhaj; Wilson Naik Bhukya; Rajendra Prasad Lal', 
 'category': 'Journal'},{'title': 'A Novel Space-Efficient Method for Detecting Network-Wide Heavy Hitters in Software-Defined Networking Using P4-Switch', 
 'venue': 'International Arab Journal of Information Technology', 
 'year': 2025, 
 'authors': 'Ali Alhaj; Wilson Bhukya; Rajendra Lal', 
 'category': 'Journal'}],
        'google_scholar_url': 'https://scholar.google.com/citations?user=-hxvZawAAAAJ&hl=en',
        'personal_website_url': '',
        
        'courses': [
            {'name': 'Network Security', 'is_current': True},
            {'name': 'Computer Networks', 'is_current': False},
            {'name': 'Internet Technology Lab', 'is_current': False},
            {'name': 'Software Project Management', 'is_current': False},
        ],
        'awards': [],
        'groups': [],
    },

    {
        'name': 'Dr. Atul Negi',
        'title': 'Professor',
        'department': 'SCIS',
        'email': 'atul.negi@uohyd.ac.in',
        'office': 'SCIS Old Building, Room E-211',
        'photo_url': '/uploads/atul_negi.jpg',
        'tagline': 'Advancing machine learning and intelligent data analysis for real-world decision systems.',
        'bio': 'Professor at the School of Computer and Information Sciences, University of Hyderabad. His research focuses on machine learning, data mining, and intelligent systems, with contributions in similarity measures, wireless sensor networks, and explainable AI.',
        'research_areas': 'Machine Learning, Data Mining, Explainable AI, Wireless Sensor Networks, Internet of Things',
        'publications': [{'title': 'Principle application and vision in Internet of Things (IoT)', 
 'venue': 'International Conference on Computing, Communication & Automation (CCAA)', 
 'year': 2015, 
 'authors': 'Mohsen Hallaj Asghar; Atul Negi; Nasibeh Mohammadzadeh', 
 'category': 'Conference'},{'title': 'A survey of distance/similarity measures for categorical data', 
 'venue': '2014 International Joint Conference on Neural Networks (IJCNN)', 
 'year': 2014, 
 'authors': 'Madhavi Alamuri; Bapi Raju Surampudi; Atul Negi', 
 'category': 'Conference'},{'title': 'Communication and Data Trust for Wireless Sensor Networks Using D-S Theory', 
 'venue': 'IEEE Sensors Journal', 
 'year': 2017, 
 'authors': 'Vijender Busi Reddy; Sarma Venkataraman; Atul Negi', 
 'category': 'Journal'},{'title': 'A data locality based scheduler to enhance MapReduce performance in heterogeneous environments', 
 'venue': 'Future Generation Computer Systems', 
 'year': 2019, 
 'authors': 'Nenavath Srinivas Naik; Atul Negi; Tapas Bapu B. R.; R. Anitha', 
 'category': 'Journal'},{'title': 'A Comparative Review of Expert Systems, Recommender Systems, and Explainable AI', 
 'venue': '2022 IEEE 7th International Conference on Computing, Communication and Automation (ICCCA)', 
 'year': 2022, 
 'authors': 'Mudavath Ravi; Atul Negi; Sanjay Chitnis', 
 'category': 'Conference'}],
        'google_scholar_url': 'https://scholar.google.com/citations?user=-rvDlDIAAAAJ&hl=en',
        'personal_website_url': '',
        'research_trajectory': "He has authored more than 150 publications in peer-reviewed conferences and journals and more than 2000 citations. He has co-edited conference proceedings volumes from Springer and IEEE as Program Chair, and played the role of General Chair in various conferences. He is also an Associate Editor for Springer-Nature Computer Science. He has worked as co-investigator on the Indian Language Resource Center (Telugu) sponsored research projects from DIT, Govt. of India, Principal Investigator for the Robust OCR Project, DIT, and co-investigator with projects from ISRO and MHA. Currently he is associated with the 100 5G Labs project from the Department of Telecommunications, Govt. of India, at University of Hyderabad. He has successfully guided 12 doctoral dissertations while mentoring several others, and supervised nearly 100 M. Tech dissertations. His work on Telugu OCR and other contributions in Handwriting Recognition are well cited.",
        'courses': [
            {'name': 'Computer Networks', 'is_current': True},
            {'name': 'Computer Networks Lab', 'is_current': True},
            {'name': 'Problem Solving Methods', 'is_current': False},
            {'name': 'Computer Organization and Architecture', 'is_current': False},
            {'name': 'Pattern Recognition', 'is_current': False},
            {'name': 'Deep Learning', 'is_current': False},
            {'name': 'Machine Learning', 'is_current': False},
            {'name': 'Operating Systems', 'is_current': False},
        ],
        'awards': [],
        'groups': [],
    },
]


# =============================================================================
# DEMO FACULTY — fills the directory so the grader demo doesn't look empty.
# =============================================================================

# DEMO_FACULTY = [
#     {
#         'name': 'Dr. Ranjeev Wanker',
#         'title': 'Professor',
#         'department': 'Computer Science',
#         'email': 'ranjeev.wanker@scis.edu',
#         'office': 'Building 5, Room 214',
#         'photo_url': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
#         'tagline': 'Exploring the intersection of biological motor control and high-dimensional robotic manipulation.',
#         'research_trajectory': "The Thorne Group focuses on the intersection of biological motor control and high-dimensional robotic manipulation. Our goal is to develop adaptive neural architectures that allow machines to learn complex physical tasks with the efficiency of human cognition.",
#         'research_areas': 'Autonomous Systems, Neural Control, Robotics',
#         'google_scholar_url': 'https://scholar.google.com/citations?user=example1',
#         'publications': [
#             {'title': 'Decentralized Neuromorphic Control of High-DoF Soft Manipulators', 'venue': 'Nature Communications', 'year': 2024, 'authors': 'Thorne, R. M.; Okonkwo, A.', 'category': 'Journal'},
#             {'title': 'Predictive State Space Modeling in Unstructured Robotic Environments', 'venue': 'IEEE Robotics', 'year': 2023, 'authors': 'Chen, L.; Thorne, R. M.', 'category': 'Conference'},
#             {'title': 'Proprioceptive Intelligence: The Role of Tension in Biological and Synthetic Systems', 'venue': 'Science Robotics', 'year': 2023, 'authors': 'Thorne, R. M.', 'category': 'Journal'},
#         ],
#         'groups': [
#             {'name': 'Neural Synergy Lab', 'description': 'Applying proprioceptive feedback in soft robotic actuators.'},
#         ],
#       'courses': [
#     {'code': 'CE 501', 'name': 'Structural Synthesis', 'semester': 'Fall 2025', 'is_current': True},
#     {'code': '', 'name': 'Computational Geometry in Design', 'semester': '', 'is_current': True},
#     {'code': '', 'name': 'Advanced Concrete Structures', 'semester': '', 'is_current': False},
#     {'code': '', 'name': 'Introduction to Civil Engineering', 'semester': '', 'is_current': False},
# ],
#     },
   #{
    #    'name': 'Dr. Rukma Rekha',
     #   'title': 'Professor of Urban Engineering',
      #  'department': 'Engineering',
       # 'email': 'rukma.rekha@scis.edu',
#         'office': 'Building 9, Room 102',
#         'photo_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
#         'tagline': 'Pioneering the intersection of sustainable infrastructure and cognitive urbanism.',
#         'research_trajectory': "Dr. Rekha leads research on bio-mimicry in structural engineering — how principles from living systems can revolutionize carbon sequestration in metropolitan centers.",
#         'research_areas': 'Sustainable Infrastructure, Urban Systems, Carbon Capture',
#         'google_scholar_url': 'https://scholar.google.com/citations?user=example2',
#         'personal_website_url': 'https://rukmarekha.example.edu',
#         'publications': [
#             {'title': 'Carbon-Sequestering Facades for Dense Urban Environments', 'venue': 'Nature Infrastructure', 'year': 2025, 'authors': 'Rekha, R.', 'category': 'Journal'},
#         ],
#       
#         'courses': [
#             {'code': 'ENG 412', 'name': 'Sustainable Urban Systems', 'semester': 'Spring 2026'},
#         ],
#     },
#     {
#         'name': 'Dr. Chakravarty Bhagvati',
#         'title': 'Professor of Civil Engineering',
#         'department': 'Engineering',
#         'email': 'c.bhagvati@scis.edu',
#         'office': 'Building 7, Room 311',
#         'photo_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
#         'tagline': 'Building the futures of the built environment.',
#         'bio': 'Leads the SCIS Structural Synthesis Lab, researching the intersection of algorithmic geometry and sustainable material systems. His work challenges traditional construction paradigms by integrating autonomous research with bio-based composites.',
#         'research_areas': 'Sustainable Infrastructure, Robotic Fabrication, Computational Design',
#         'google_scholar_url': 'https://scholar.google.com/citations?user=example3',
#        'publications': [
#     {'title': 'Bio-Polymer Synthesis in Large-Scale Additive Manufacturing of Load-Bearing Frames',
#      'year': 2025, 'venue': 'Journal of Computational Design', 'authors': 'Bhagvati, C.; Jiang, R.',
#      'category': 'Journal', 'url': 'https://doi.org/10.1000/example1'},
#     {'title': 'Adaptive Tensegrity: Real-time Feedback Loops in Civil Infrastructure',
#      'year': 2025, 'venue': 'Nature Infrastructure', 'authors': 'Bhagvati, C.',
#      'category': 'Journal', 'url': 'https://doi.org/10.1000/example2'},
#     # Sparse entries — only what faculty gave you
#     {'title': 'Kinetic Facades and the Thermal Inertia of Concrete Shells',
#      'year': 2024, 'url': 'https://arxiv.org/abs/2401.00001'},
#     {'title': 'Computational Geometry Approaches to Sustainable Bridge Design',
#      'year': 2023, 'url': 'https://scholar.google.com/scholar?q=example'},
#     {'title': 'Responsive Tensegrity Structures for Seismic Zones',
#      'year': 2023},  # no URL — will render as non-clickable
# ],
#         'courses': [
#             {'code': 'CE 501', 'name': 'Structural Synthesis', 'semester': 'Fall 2025'},
#         ],
#     },
#]


def run(include_todos=False):
    """
    By default, seeds only DEMO_FACULTY so you don't get 'Dr. TODO' in your directory.
    Once you've filled REAL_FACULTY, run: python seed.py --with-real
    """
    with app.app_context():
        db.drop_all()
        db.create_all()

        #entries = list(DEMO_FACULTY)
        entries =list()
        if include_todos:
            real = [e for e in REAL_FACULTY if not e['name'].startswith('TODO')]
            entries = real + entries

        for entry in entries:
            entry = dict(entry)  # don't mutate the module-level dicts
            pubs = entry.pop('publications', [])
            courses = entry.pop('courses', [])
            groups = entry.pop('groups', [])
            media = entry.pop('media', [])
            awards = entry.pop('awards', [])
            f = Faculty(**entry)
            db.session.add(f)
            db.session.flush()
            for p in pubs:
                db.session.add(Publication(faculty_id=f.id, **p))
            for c in courses:
                db.session.add(Course(faculty_id=f.id, **c))
            for g in groups:
                db.session.add(ResearchGroup(faculty_id=f.id, **g))
            for m in media:
                db.session.add(MediaMention(faculty_id=f.id, **m))
            for a in awards:
                db.session.add(Award(faculty_id=f.id, **a))
        db.session.commit()
        print(f'Seeded {len(entries)} faculty.')


if __name__ == '__main__':
    import sys
    include = '--with-real' in sys.argv
    run(include_todos=include)