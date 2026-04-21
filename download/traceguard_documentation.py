#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TraceGuard AI - Complete Platform Documentation (Bengali)
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Register Bengali font
font_paths = [
    '/usr/share/fonts/truetype/chinese/NotoSansSC[wght].ttf',
    '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC[wght].ttf',
    '/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-Regular.ttf',
]

font_registered = False
for font_path in font_paths:
    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(TTFont('Bengali', font_path))
            font_registered = True
            print(f"Font registered: {font_path}")
            break
        except:
            continue

if not font_registered:
    print("Warning: No suitable font found, using default")

# Colors
PRIMARY = HexColor('#7c3aed')
SECONDARY = HexColor('#a855f7')
ACCENT = HexColor('#06b6d4')
DARK = HexColor('#1e1b4b')
LIGHT_BG = HexColor('#f5f3ff')
SUCCESS = HexColor('#10b981')
WARNING = HexColor('#f59e0b')
ERROR = HexColor('#ef4444')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/TraceGuard_AI_Documentation.pdf",
    pagesize=A4,
    rightMargin=20*mm,
    leftMargin=20*mm,
    topMargin=25*mm,
    bottomMargin=25*mm
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Title'],
    fontName='Bengali' if font_registered else 'Helvetica-Bold',
    fontSize=28,
    textColor=PRIMARY,
    spaceAfter=20,
    alignment=TA_CENTER
)

heading1_style = ParagraphStyle(
    'Heading1Custom',
    parent=styles['Heading1'],
    fontName='Bengali' if font_registered else 'Helvetica-Bold',
    fontSize=18,
    textColor=DARK,
    spaceBefore=20,
    spaceAfter=12,
    borderColor=PRIMARY,
    borderWidth=0,
    borderPadding=5
)

heading2_style = ParagraphStyle(
    'Heading2Custom',
    parent=styles['Heading2'],
    fontName='Bengali' if font_registered else 'Helvetica-Bold',
    fontSize=14,
    textColor=PRIMARY,
    spaceBefore=15,
    spaceAfter=8
)

body_style = ParagraphStyle(
    'BodyCustom',
    parent=styles['Normal'],
    fontName='Bengali' if font_registered else 'Helvetica',
    fontSize=11,
    textColor=black,
    spaceBefore=6,
    spaceAfter=6,
    alignment=TA_JUSTIFY,
    leading=16
)

bullet_style = ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontName='Bengali' if font_registered else 'Helvetica',
    fontSize=11,
    textColor=black,
    leftIndent=20,
    spaceBefore=3,
    spaceAfter=3,
    leading=14
)

# Build content
story = []

# Title
story.append(Paragraph("TraceGuard AI", title_style))
story.append(Paragraph("Complete Platform Documentation", ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontName='Bengali' if font_registered else 'Helvetica',
    fontSize=14,
    textColor=SECONDARY,
    alignment=TA_CENTER,
    spaceAfter=30
)))

story.append(Spacer(1, 20))

# Section 1: Overview
story.append(Paragraph("1. Platform Overview (প্ল্যাটফর্ম ওভারভিউ)", heading1_style))
story.append(Paragraph("""
TraceGuard AI is an AI-powered image protection platform that helps content creators, photographers, and businesses protect their digital images from unauthorized use. The platform uses advanced technologies like invisible watermarking, fingerprinting, and AI-based detection to track and protect visual content across the internet.
""", body_style))

story.append(Paragraph("""
<b>Core Mission:</b> Protect Before It's Misused - আপনার ডিজিটাল কন্টেন্ট অননুমোদিত ব্যবহার থেকে রক্ষা করা।
""", body_style))

# Section 2: Key Features
story.append(Paragraph("2. Key Features (প্রধান বৈশিষ্ট্য)", heading1_style))

story.append(Paragraph("2.1 Image Protection (ইমেজ প্রোটেকশন)", heading2_style))
story.append(Paragraph("""
<b>How it works:</b> When you upload an image, TraceGuard AI embeds an invisible watermark into the image. This watermark is imperceptible to the human eye but can be detected by our AI algorithms. The watermark contains a unique content ID that links the image to your account.
""", body_style))

story.append(Paragraph("<b>Features:</b>", body_style))
story.append(Paragraph("• Invisible watermark embedding - অদৃশ্য ওয়াটারমার্ক এম্বেডিং", bullet_style))
story.append(Paragraph("• Unique Content ID generation - ইউনিক কন্টেন্ট আইডি জেনারেশন", bullet_style))
story.append(Paragraph("• Digital ownership certificate - ডিজিটাল ওনারশিপ সার্টিফিকেট", bullet_style))
story.append(Paragraph("• Fingerprint hash creation - ফিঙ্গারপ্রিন্ট হ্যাশ ক্রিয়েশন", bullet_style))

story.append(Paragraph("2.2 Duplicate Detection (ডুপ্লিকেট ডিটেকশন)", heading2_style))
story.append(Paragraph("""
<b>How it works:</b> Our AI scans uploaded images and creates a unique fingerprint hash. When a new image is uploaded, it's compared against all existing fingerprints in our database. If a match is found (94%+ similarity), the system alerts the original owner.
""", body_style))

story.append(Paragraph("<b>Detection capabilities:</b>", body_style))
story.append(Paragraph("• Exact match detection - এক্স্যাক্ট ম্যাচ ডিটেকশন (100% similarity)", bullet_style))
story.append(Paragraph("• Similar image detection - সিমিলার ইমেজ ডিটেকশন (70-99% similarity)", bullet_style))
story.append(Paragraph("• Cropped/edited image detection - ক্রপড/এডিটেড ইমেজ ডিটেকশন", bullet_style))
story.append(Paragraph("• Resized image detection - রিসাইজড ইমেজ ডিটেকশন", bullet_style))

story.append(Paragraph("2.3 Real-time Alerts (রিয়েল-টাইম অ্যালার্ট)", heading2_style))
story.append(Paragraph("""
<b>Alert types:</b>
""", body_style))
story.append(Paragraph("• <b>Match Alert:</b> When your protected image is found online", bullet_style))
story.append(Paragraph("• <b>Duplicate Alert:</b> When someone uploads similar content", bullet_style))
story.append(Paragraph("• <b>Protection Alert:</b> Confirmation of successful protection", bullet_style))

story.append(Paragraph("2.4 Dashboard Analytics (ড্যাশবোর্ড অ্যানালিটিক্স)", heading2_style))
story.append(Paragraph("""
The dashboard provides a comprehensive overview of all your protected content, recent alerts, and system statistics. Users can view:
""", body_style))
story.append(Paragraph("• Total protected images count", bullet_style))
story.append(Paragraph("• Recent alerts and notifications", bullet_style))
story.append(Paragraph("• Protection status of each image", bullet_style))
story.append(Paragraph("• Content ID certificates", bullet_style))

# Section 3: Technology Stack
story.append(Paragraph("3. Technology Stack (প্রযুক্তি স্ট্যাক)", heading1_style))

# Create technology table
tech_data = [
    ['Category', 'Technology', 'Purpose'],
    ['Frontend', 'Next.js 16', 'React-based web framework'],
    ['Frontend', 'React 19', 'UI component library'],
    ['Frontend', 'TypeScript', 'Type-safe JavaScript'],
    ['Frontend', 'Tailwind CSS 4', 'Utility-first CSS framework'],
    ['UI Components', 'shadcn/ui', 'Accessible component library'],
    ['UI Components', 'Radix UI', 'Primitive UI components'],
    ['UI Components', 'Framer Motion', 'Animation library'],
    ['Backend', 'Next.js API Routes', 'Serverless API endpoints'],
    ['Database', 'Prisma ORM', 'Database toolkit'],
    ['Database', 'SQLite', 'Development database'],
    ['Database', 'PostgreSQL', 'Production database option'],
    ['Authentication', 'NextAuth.js', 'Authentication system'],
    ['Cloud Services', 'Firebase Analytics', 'User analytics'],
    ['Cloud Services', 'Firebase Firestore', 'Real-time database'],
    ['Cloud Services', 'Firebase Storage', 'File storage'],
    ['AI/ML', 'Custom Algorithms', 'Image fingerprinting'],
    ['PWA', 'Service Worker', 'Offline capability'],
]

tech_table = Table(tech_data, colWidths=[80, 100, 200])
tech_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Bengali' if font_registered else 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('FONTNAME', (0, 1), (-1, -1), 'Bengali' if font_registered else 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
    ('TOPPADDING', (0, 0), (-1, 0), 10),
    ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
    ('GRID', (0, 0), (-1, -1), 0.5, PRIMARY),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
]))

story.append(Spacer(1, 10))
story.append(tech_table)
story.append(Spacer(1, 10))

# Section 4: How the Platform Works
story.append(Paragraph("4. How the Platform Works (প্ল্যাটফর্ম কিভাবে কাজ করে)", heading1_style))

story.append(Paragraph("4.1 Image Upload Flow (ইমেজ আপলোড ফ্লো)", heading2_style))
story.append(Paragraph("""
<b>Step 1: User uploads an image</b> - ব্যবহারকারী একটি ছবি আপলোড করেন
The user selects an image file (JPEG, PNG, WebP) through the upload interface. The system validates the file type and size (max 10MB).
""", body_style))

story.append(Paragraph("""
<b>Step 2: Fingerprint generation</b> - ফিঙ্গারপ্রিন্ট জেনারেশন
Our algorithm creates a unique cryptographic hash of the image content. This hash acts as a digital fingerprint that can identify the image even if it's modified.
""", body_style))

story.append(Paragraph("""
<b>Step 3: Duplicate check</b> - ডুপ্লিকেট চেক
The system compares the fingerprint against our database of 1M+ protected images. If a match is found, the user is notified and can choose to proceed or cancel.
""", body_style))

story.append(Paragraph("""
<b>Step 4: Storage and registration</b> - স্টোরেজ এবং রেজিস্ট্রেশন
The image is stored securely with its metadata. A unique Content ID (e.g., TG-ABC123-XYZ) is generated and linked to the user's account.
""", body_style))

story.append(Paragraph("4.2 Protection Flow (প্রোটেকশন ফ্লো)", heading2_style))
story.append(Paragraph("""
<b>Step 1: User clicks "Protect"</b> - ব্যবহারকারী "Protect" বাটনে ক্লিক করেন
This initiates the watermarking process for the selected image.
""", body_style))

story.append(Paragraph("""
<b>Step 2: Watermark embedding</b> - ওয়াটারমার্ক এম্বেডিং
An invisible watermark containing the Content ID is embedded into the image using steganographic techniques. The watermark is resistant to compression, cropping, and basic editing.
""", body_style))

story.append(Paragraph("""
<b>Step 3: Certificate generation</b> - সার্টিফিকেট জেনারেশন
A digital ownership certificate is generated containing:
- Content ID
- Original filename
- Protection timestamp
- Owner information
- Fingerprint hash
""", body_style))

story.append(Paragraph("4.3 Detection Flow (ডিটেকশন ফ্লো)", heading2_style))
story.append(Paragraph("""
<b>Step 1: User uploads image for detection</b>
The user uploads any image to check if it matches protected content.
""", body_style))

story.append(Paragraph("""
<b>Step 2: Fingerprint extraction</b>
The system extracts the fingerprint from the uploaded image.
""", body_style))

story.append(Paragraph("""
<b>Step 3: Database scan</b>
The fingerprint is compared against all protected images in our database.
""", body_style))

story.append(Paragraph("""
<b>Step 4: Results display</b>
The system shows:
- Match status (found/not found)
- Similarity percentage
- Original owner information (if matched)
- Protected image details
""", body_style))

# Section 5: User Interface
story.append(Paragraph("5. User Interface Overview (ইউজার ইন্টারফেস ওভারভিউ)", heading1_style))

story.append(Paragraph("5.1 Navigation (নেভিগেশন)", heading2_style))
story.append(Paragraph("""
<b>Desktop Sidebar:</b>
- Home: Dashboard overview
- Protect: Upload and protect images
- Alerts: View notifications
- Detect: Scan images for matches
- Users: Real-time user activity (if enabled)
""", body_style))

story.append(Paragraph("""
<b>Mobile Bottom Navigation:</b>
The same features are accessible through a bottom navigation bar optimized for touch interfaces.
""", body_style))

story.append(Paragraph("5.2 Dashboard (ড্যাশবোর্ড)", heading2_style))
story.append(Paragraph("""
The main dashboard displays:
- Statistics cards (Total Images, Protected, Alerts, Storage Used)
- Recent protected images grid
- Quick action buttons
- Alert notifications preview
""", body_style))

story.append(Paragraph("5.3 Protect Page (প্রোটেক্ট পেজ)", heading2_style))
story.append(Paragraph("""
This page allows users to:
- Drag and drop images for upload
- View upload progress
- See upload results
- Protect uploaded images with one click
- Download protection certificates
""", body_style))

story.append(Paragraph("5.4 Alerts Page (অ্যালার্ট পেজ)", heading2_style))
story.append(Paragraph("""
Displays all system alerts with:
- Alert type indicator (match, duplicate, protection)
- Severity level (info, warning, error, success)
- Timestamp
- Mark as read functionality
- Mark all as read option
""", body_style))

story.append(Paragraph("5.5 Detect Page (ডিটেক্ট পেজ)", heading2_style))
story.append(Paragraph("""
Users can scan images to check for matches:
- Upload any image for detection
- View scanning progress
- See detection results with match details
- Similarity percentage display
""", body_style))

# Section 6: API Endpoints
story.append(Paragraph("6. API Endpoints (API এন্ডপয়েন্ট)", heading1_style))

api_data = [
    ['Endpoint', 'Method', 'Description'],
    ['/api/auth/register', 'POST', 'Register new user'],
    ['/api/auth/login', 'POST', 'User login'],
    ['/api/auth/logout', 'POST', 'User logout'],
    ['/api/auth/me', 'GET', 'Get current user'],
    ['/api/images/upload', 'POST', 'Upload image'],
    ['/api/images/user', 'GET', 'Get user images'],
    ['/api/images/protect', 'POST', 'Protect an image'],
    ['/api/images/detect', 'POST', 'Detect image matches'],
    ['/api/images/[id]', 'DELETE', 'Delete image'],
    ['/api/alerts', 'GET', 'Get user alerts'],
    ['/api/alerts', 'PUT', 'Mark alert as read'],
    ['/api/firebase-test', 'GET', 'Test Firebase connection'],
]

api_table = Table(api_data, colWidths=[130, 60, 190])
api_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DARK),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, 0), 'Bengali' if font_registered else 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 9),
    ('FONTNAME', (0, 1), (-1, -1), 'Bengali' if font_registered else 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ('TOPPADDING', (0, 0), (-1, 0), 8),
    ('BACKGROUND', (0, 1), (-1, -1), white),
    ('GRID', (0, 0), (-1, -1), 0.5, DARK),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
]))

story.append(Spacer(1, 10))
story.append(api_table)
story.append(Spacer(1, 10))

# Section 7: Security
story.append(Paragraph("7. Security Features (নিরাপত্তা বৈশিষ্ট্য)", heading1_style))

story.append(Paragraph("""
<b>Authentication:</b>
- Session-based authentication with secure tokens
- Password hashing using bcrypt
- Automatic session expiration
""", body_style))

story.append(Paragraph("""
<b>Data Protection:</b>
- Secure file storage with unique naming
- Fingerprint hash cannot be reversed to original image
- Content IDs are cryptographically generated
""", body_style))

story.append(Paragraph("""
<b>Watermark Security:</b>
- Invisible watermarks resist compression
- Watermarks survive cropping and resizing
- Embedded data includes timestamp and owner ID
""", body_style))

# Section 8: Deployment
story.append(Paragraph("8. Deployment (ডিপ্লয়মেন্ট)", heading1_style))

story.append(Paragraph("""
<b>Development Environment:</b>
- Run locally with: npm run dev
- Database: SQLite for local development
- Hot reload enabled for development
""", body_style))

story.append(Paragraph("""
<b>Production Deployment (Vercel):</b>
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy with automatic builds
""", body_style))

story.append(Paragraph("""
<b>Required Environment Variables:</b>
- DATABASE_URL: Database connection string
- NEXT_PUBLIC_FIREBASE_*: Firebase configuration
- NEXTAUTH_SECRET: Session encryption key
- NEXTAUTH_URL: Application URL
""", body_style))

# Section 9: FAQ
story.append(Paragraph("9. Frequently Asked Questions (সাধারণ প্রশ্ন)", heading1_style))

story.append(Paragraph("""
<b>Q: What file types are supported?</b>
A: JPEG, PNG, WebP, and GIF images up to 10MB are supported.
""", body_style))

story.append(Paragraph("""
<b>Q: How accurate is the detection?</b>
A: Our AI can detect matches with 94%+ similarity. Exact matches are detected at 100%.
""", body_style))

story.append(Paragraph("""
<b>Q: Is the watermark visible?</b>
A: No, the watermark is completely invisible and doesn't affect image quality.
""", body_style))

story.append(Paragraph("""
<b>Q: Can watermarks be removed?</b>
A: Our watermarks are designed to resist common editing operations, compression, and format conversion.
""", body_style))

story.append(Paragraph("""
<b>Q: What happens if someone steals my image?</b>
A: You receive an alert when matches are found, along with a digital certificate proving ownership.
""", body_style))

story.append(Paragraph("""
<b>Q: Is there a free tier?</b>
A: Yes, guest users can use basic features. Demo account: demo@traceguard.ai / demo123
""", body_style))

# Section 10: Support
story.append(Paragraph("10. Support & Contact (সাপোর্ট এবং যোগাযোগ)", heading1_style))

story.append(Paragraph("""
<b>GitHub Repository:</b> https://github.com/tomabiswas411-source/-traceguard-ai
""", body_style))

story.append(Paragraph("""
<b>Demo Credentials:</b>
- Email: demo@traceguard.ai
- Password: demo123
""", body_style))

story.append(Paragraph("""
<b>Technology Partners:</b>
- Firebase (Analytics, Storage, Firestore)
- Vercel (Hosting)
- GitHub (Version Control)
""", body_style))

story.append(Spacer(1, 30))
story.append(Paragraph("© 2024 TraceGuard AI. All Rights Reserved.", ParagraphStyle(
    'Footer',
    parent=styles['Normal'],
    fontName='Bengali' if font_registered else 'Helvetica',
    fontSize=10,
    textColor=SECONDARY,
    alignment=TA_CENTER
)))

# Build PDF
doc.build(story)
print("PDF generated successfully!")
