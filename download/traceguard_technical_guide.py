#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TraceGuard AI - Complete Technical Documentation (Bengali)
Detailed explanation of each technology and how they work
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Register font
font_paths = [
    '/usr/share/fonts/truetype/chinese/NotoSansSC[wght].ttf',
    '/usr/share/fonts/truetype/lxgw-wenkai/LXGWWenKai-Regular.ttf',
]

font_registered = False
for font_path in font_paths:
    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(TTFont('Bengali', font_path))
            font_registered = True
            break
        except:
            continue

# Colors
PRIMARY = HexColor('#7c3aed')
SECONDARY = HexColor('#a855f7')
ACCENT = HexColor('#06b6d4')
DARK = HexColor('#1e1b4b')
LIGHT_BG = HexColor('#f5f3ff')
CODE_BG = HexColor('#1e1e1e')
SUCCESS = HexColor('#10b981')
WARNING = HexColor('#f59e0b')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/TraceGuard_Technical_Guide.pdf",
    pagesize=A4,
    rightMargin=18*mm,
    leftMargin=18*mm,
    topMargin=22*mm,
    bottomMargin=22*mm
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=26, textColor=PRIMARY, spaceAfter=15, alignment=TA_CENTER)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=16, textColor=DARK, spaceBefore=18, spaceAfter=10)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=13, textColor=PRIMARY, spaceBefore=12, spaceAfter=6)
h3_style = ParagraphStyle('H3', parent=styles['Heading3'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=11, textColor=SECONDARY, spaceBefore=8, spaceAfter=4)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=10, textColor=black, spaceBefore=4, spaceAfter=4, alignment=TA_JUSTIFY, leading=14)
bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=10, textColor=black, leftIndent=15, spaceBefore=2, spaceAfter=2, leading=13)
code_style = ParagraphStyle('Code', parent=styles['Normal'], fontName='Courier', fontSize=8, textColor=HexColor('#333333'), backColor=LIGHT_BG, spaceBefore=3, spaceAfter=3, leftIndent=10, rightIndent=10)

story = []

# Title
story.append(Paragraph("TraceGuard AI", title_style))
story.append(Paragraph("Complete Technical Guide - সম্পূর্ণ টেকনিক্যাল গাইড", ParagraphStyle('Sub', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=12, textColor=SECONDARY, alignment=TA_CENTER, spaceAfter=25)))

# ========== SECTION 1: FRONTEND ==========
story.append(Paragraph("1. Frontend Technologies (ফ্রন্টএন্ড টেকনোলজি)", h1_style))

story.append(Paragraph("1.1 Next.js 16 - নেক্সট.জেএস", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Next.js হলো একটি React-based ফুল-স্ট্যাক ওয়েব ফ্রেমওয়ার্ক যা প্রোডাকশন-গ্রেড অ্যাপ্লিকেশন তৈরি করতে ব্যবহৃত হয়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Server-Side Rendering (SSR):</b> পেজ লোড হওয়ার আগে সার্ভারে HTML জেনারেট হয়, SEO এবং পারফরম্যান্স উন্নত হয়", bullet_style))
story.append(Paragraph("• <b>API Routes:</b> /api/ ফোল্ডারে ব্যাকএন্ড API তৈরি করা যায় - আলাদা সার্ভার লাগে না", bullet_style))
story.append(Paragraph("• <b>File-based Routing:</b> src/app/page.tsx = homepage, src/app/dashboard/page.tsx = /dashboard", bullet_style))
story.append(Paragraph("• <b>Image Optimization:</b> অটোমেটিক ইমেজ কমপ্রেশন এবং lazy loading", bullet_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. ব্যবহারকারী ব্রাউজারে URL টাইপ করে
2. Next.js সার্ভার রিকোয়েস্ট গ্রহণ করে
3. React কম্পোনেন্ট সার্ভারে render হয়
4. সম্পূর্ণ HTML ব্রাউজারে পাঠানো হয়
5. ব্রাউজারে JavaScript hydrate হয় (ইন্টারঅ্যাক্টিভ হয়)
""", body_style))

story.append(Paragraph("1.2 React 19 - রিয়্যাক্ট", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> React হলো একটি JavaScript লাইব্রেরি যা UI (User Interface) তৈরি করতে ব্যবহৃত হয়। এটা কম্পোনেন্ট-ভিত্তিক আর্কিটেকচার ব্যবহার করে।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Components:</b> Dashboard, UploadForm, AlertList - প্রতিটি আলাদা কম্পোনেন্ট", bullet_style))
story.append(Paragraph("• <b>State Management:</b> useState - ইউজার ডেটা, ইমেজ লিস্ট সংরক্ষণ", bullet_style))
story.append(Paragraph("• <b>Hooks:</b> useEffect - API থেকে ডেটা লোড করা", bullet_style))
story.append(Paragraph("• <b>Event Handling:</b> onClick, onChange - বাটন ক্লিক, ফর্ম সাবমিট", bullet_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. প্যারেন্ট কম্পোনেন্ট থেকে চাইল্ড কম্পোনেন্টে props পাঠায়
2. State পরিবর্তন হলে React automatically UI আপডেট করে
3. Virtual DOM ব্যবহার করে শুধু পরিবর্তিত অংশ re-render হয়
4. এটা দ্রুত এবং ইফিশিয়েন্ট
""", body_style))

story.append(Paragraph("1.3 TypeScript - টাইপস্ক্রিপ্ট", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> TypeScript হলো JavaScript এর superset যা type safety প্রদান করে। কোড লেখার সময় ভুল ধরা যায়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Type Definitions:</b> UserType, ImageType, AlertType - ডেটা স্ট্রাকচার নির্ধারণ", bullet_style))
story.append(Paragraph("• <b>Error Prevention:</b> ভুল টাইপ ডেটা পাস করলে কম্পাইল টাইমে এরর দেখায়", bullet_style))
story.append(Paragraph("• <b>IntelliSense:</b> VS Code-এ অটো-কমপ্লিট এবং ডকুমেন্টেশন", bullet_style))

story.append(Paragraph("<b>উদাহরণ:</b>", body_style))
story.append(Paragraph("interface UserType { id: string; email: string; name: string; }", code_style))
story.append(Paragraph("const [user, setUser] = useState<UserType | null>(null);", code_style))

story.append(Paragraph("1.4 Tailwind CSS 4 - টেইলউইন্ড সিএসএস", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Tailwind হলো একটি utility-first CSS framework। আলাদা CSS ফাইল না লিখে, HTML-এ সরাসরি class ব্যবহার করা যায়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Responsive Design:</b> sm:, md:, lg: - বিভিন্ন স্ক্রিন সাইজের জন্য আলাদা স্টাইল", bullet_style))
story.append(Paragraph("• <b>Dark Mode:</b> dark: prefix - ডার্ক মোড সাপোর্ট", bullet_style))
story.append(Paragraph("• <b>Animations:</b> animate-pulse, animate-spin - বিল্ট-ইন অ্যানিমেশন", bullet_style))
story.append(Paragraph("• <b>Custom Gradients:</b> bg-gradient-to-r from-purple-600 to-pink-500", bullet_style))

story.append(Paragraph("1.5 Framer Motion - ফ্রেমার মোশন", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Framer Motion হলো React-এর জন্য একটি অ্যানিমেশন লাইব্রেরি যা declarative ভাবে অ্যানিমেশন তৈরি করতে দেয়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Page Transitions:</b> পেজ চেঞ্জের সময় fade, slide অ্যানিমেশন", bullet_style))
story.append(Paragraph("• <b>Button Effects:</b> whileHover={{ scale: 1.05 }} - হোভারে বাটন বড় হয়", bullet_style))
story.append(Paragraph("• <b>Modal Animations:</b> Dialog ওপেন/ক্লোজ অ্যানিমেশন", bullet_style))
story.append(Paragraph("• <b>Loading States:</b> animate={{ rotate: 360 }} - লোডিং স্পিনার", bullet_style))

# ========== SECTION 2: BACKEND ==========
story.append(Paragraph("2. Backend Technologies (ব্যাকএন্ড টেকনোলজি)", h1_style))

story.append(Paragraph("2.1 Next.js API Routes - এপিআই রুট", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Next.js API Routes আলাদা ব্যাকএন্ড সার্ভার ছাড়াই API endpoint তৈরি করতে দেয়। src/app/api/ ফোল্ডারে ফাইল তৈরি করলেই API তৈরি হয়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• /api/auth/login - ইউজার লগইন ভ্যালিডেশন", bullet_style))
story.append(Paragraph("• /api/images/upload - ইমেজ আপলোড এবং প্রসেসিং", bullet_style))
story.append(Paragraph("• /api/images/detect - ডুপ্লিকেট ডিটেকশন", bullet_style))
story.append(Paragraph("• /api/alerts - অ্যালার্ট ম্যানেজমেন্ট", bullet_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. ক্লায়েন্ট fetch() দিয়ে API call করে
2. API Route রিকোয়েস্ট গ্রহণ করে
3. ডেটাবেস থেকে ডেটা কোয়েরি করে
4. JSON response রিটার্ন করে
""", body_style))

story.append(Paragraph("2.2 Prisma ORM - প্রিজমা ওআরএম", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Prisma হলো একটি Object-Relational Mapping (ORM) টুল যা ডেটাবেস কোয়েরি সহজ করে। SQL না লিখে JavaScript দিয়ে ডেটাবেস অ্যাক্সেস করা যায়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Schema Definition:</b> prisma/schema.prisma - ডেটাবেস স্ট্রাকচার", bullet_style))
story.append(Paragraph("• <b>Type-safe Queries:</b> prisma.user.findUnique() - টাইপ-সেফ কোয়েরি", bullet_style))
story.append(Paragraph("• <b>Migrations:</b> prisma migrate dev - ডেটাবেস স্কিমা আপডেট", bullet_style))
story.append(Paragraph("• <b>Relations:</b> User -> Images -> Alerts - রিলেশনাল ডেটা", bullet_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. Schema ফাইলে মডেল ডিফাইন করা হয়
2. Prisma Client অটোমেটিক জেনারেট হয়
3. কোড থেকে টাইপ-সেফ কোয়েরি চালানো যায়
4. নেটিভ SQL-এর চেয়ে সহজ এবং সিকিউর
""", body_style))

story.append(Paragraph("<b>উদাহরণ:</b>", body_style))
story.append(Paragraph("// User খুঁজুন", code_style))
story.append(Paragraph("const user = await prisma.user.findUnique({ where: { email } });", code_style))
story.append(Paragraph("// Image তৈরি করুন", code_style))
story.append(Paragraph("const image = await prisma.image.create({ data: { ... } });", code_style))

story.append(Paragraph("2.3 SQLite / PostgreSQL - ডেটাবেস", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> ডেটাবেস হলো ডেটা সংরক্ষণের জন্য সিস্টেম। SQLite ফাইল-ভিত্তিক (ডেভেলপমেন্ট), PostgreSQL সার্ভার-ভিত্তিক (প্রোডাকশন)।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Users Table:</b> ইউজার ইমেইল, পাসওয়ার্ড, নাম", bullet_style))
story.append(Paragraph("• <b>Images Table:</b> আপলোড করা ইমেজের মেটাডেটা", bullet_style))
story.append(Paragraph("• <b>Alerts Table:</b> অ্যালার্ট মেসেজ এবং স্ট্যাটাস", bullet_style))
story.append(Paragraph("• <b>Sessions Table:</b> লগইন সেশন ম্যানেজমেন্ট", bullet_style))

# ========== SECTION 3: AUTHENTICATION ==========
story.append(Paragraph("3. Authentication System (অথেনটিকেশন সিস্টেম)", h1_style))

story.append(Paragraph("3.1 NextAuth.js - নেক্সটঅথ.জেএস", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> NextAuth.js হলো Next.js-এর জন্য একটি কমপ্লিট অথেনটিকেশন সলিউশন। সিকিউর লগইন সিস্টেম সহজে তৈরি করা যায়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• <b>Session Management:</b> ইউজার লগইন স্ট্যাটাস ট্র্যাক করা", bullet_style))
story.append(Paragraph("• <b>Token Generation:</b> সিকিউর session token জেনারেশন", bullet_style))
story.append(Paragraph("• <b>Password Hashing:</b> bcrypt দিয়ে পাসওয়ার্ড এনক্রিপশন", bullet_style))
story.append(Paragraph("• <b>Auto Expiry:</b> সেশন স্বয়ংক্রিয়ভাবে মেয়াদ উত্তীর্ণ", bullet_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. ইউজার ইমেইল/পাসওয়ার্ড সাবমিট করে
2. সার্ভারে পাসওয়ার্ড verify হয় (bcrypt.compare)
3. সফল হলে session token জেনারেট হয়
4. Token database-এ সংরক্ষিত হয় এবং cookie-তে সেট হয়
5. পরবর্তী রিকোয়েস্টে token যাচাই করা হয়
""", body_style))

story.append(Paragraph("3.2 Password Security - পাসওয়ার্ড নিরাপত্তা", h2_style))
story.append(Paragraph("""
<b>Bcrypt Hashing:</b> পাসওয়ার্ড সরাসরি সংরক্ষণ করা হয় না। bcrypt অ্যালগরিদম দিয়ে hash করা হয়।
""", body_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("• Salt জেনারেট করা হয় (random string)", bullet_style))
story.append(Paragraph("• পাসওয়ার্ড + salt কে hash করা হয়", bullet_style))
story.append(Paragraph("• Hash সংরক্ষণ করা হয়, মূল পাসওয়ার্ড নয়", bullet_style))
story.append(Paragraph("• লগইনে নতুন hash compare করা হয়", bullet_style))

# ========== SECTION 4: IMAGE PROTECTION ==========
story.append(Paragraph("4. Image Protection System (ইমেজ প্রোটেকশন সিস্টেম)", h1_style))

story.append(Paragraph("4.1 Fingerprint Generation - ফিঙ্গারপ্রিন্ট জেনারেশন", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Image fingerprint হলো একটি unique hash যা ইমেজের বিষয়বস্তু থেকে তৈরি করা হয়। ইমেজ পরিবর্তিত হলেও এটা চিহ্নিত করা যায়।
""", body_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. Image file কে binary data হিসেবে পড়া হয়
2. SHA-256 বা MD5 hash algorithm প্রয়োগ করা হয়
3. 64-character unique string তৈরি হয়
4. এটা database-এ সংরক্ষিত হয়
""", body_style))

story.append(Paragraph("<b>উদাহরণ:</b>", body_style))
story.append(Paragraph("fingerprintHash: 'a7b3c9d2e5f1...'", code_style))

story.append(Paragraph("4.2 Content ID Generation - কন্টেন্ট আইডি জেনারেশন", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Content ID হলো প্রতিটি সুরক্ষিত ইমেজের unique identifier যা মানুষ পড়তে পারে।
""", body_style))

story.append(Paragraph("<b>ফরম্যাট:</b> TG-[timestamp]-[random]", body_style))
story.append(Paragraph("<b>উদাহরণ:</b> TG-ABC123-XYZ789", body_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. Current timestamp নেওয়া হয় এবং base36-এ convert করা হয়
2. Random 4 bytes generate করা হয়
3. এগুলো মিলিয়ে unique ID তৈরি হয়
4. এই ID ইমেজের সাথে সংযুক্ত থাকে
""", body_style))

story.append(Paragraph("4.3 Invisible Watermarking - অদৃশ্য ওয়াটারমার্কিং", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Invisible watermark হলো এমন একটি ডেটা যা ইমেজে লুকানো থাকে কিন্তু চোখে দেখা যায় না।
""", body_style))

story.append(Paragraph("<b>প্রযুক্তি:</b> Steganography (স্টেগানোগ্রাফি)", body_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. <b>LSB (Least Significant Bit) Method:</b>
   - প্রতিটি pixel-এর RGB ভ্যালুর শেষ bit পরিবর্তন করা হয়
   - এই bit-এ Content ID এর ডেটা লুকানো হয়
   - মানুষের চোখে কোন পার্থক্য দেখা যায় না
   
2. <b>DCT (Discrete Cosine Transform):</b>
   - ইমেজকে frequency domain-এ convert করা হয়
   - Low frequency region-এ watermark বসানো হয়
   - JPEG compression-ও survive করে

3. <b>Spread Spectrum:</b>
   - Watermark কে সম্পূর্ণ ইমেজে spread করা হয়
   - Cropping বা resizing-এ টিকে থাকে
""", body_style))

story.append(Paragraph("4.4 Digital Certificate - ডিজিটাল সার্টিফিকেট", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> প্রতিটি সুরক্ষিত ইমেজের জন্য একটি digital certificate জেনারেট হয় যা ownership প্রমাণ করে।
""", body_style))

story.append(Paragraph("<b>Certificate-এ কি থাকে:</b>", body_style))
story.append(Paragraph("• Content ID: TG-ABC123-XYZ789", bullet_style))
story.append(Paragraph("• Original Filename: my-photo.jpg", bullet_style))
story.append(Paragraph("• Protection Date: 2024-01-15T10:30:00Z", bullet_style))
story.append(Paragraph("• Fingerprint Hash: a7b3c9d2e5f1...", bullet_style))
story.append(Paragraph("• Owner: user@example.com", bullet_style))

# ========== SECTION 5: DUPLICATE DETECTION ==========
story.append(Paragraph("5. Duplicate Detection System (ডুপ্লিকেট ডিটেকশন সিস্টেম)", h1_style))

story.append(Paragraph("5.1 Hash Comparison - হ্যাশ তুলনা", h2_style))
story.append(Paragraph("""
<b>কিভাবে কাজ করে:</b>
""", body_style))
story.append(Paragraph("""
1. নতুন ইমেজের fingerprint তৈরি করা হয়
2. Database-এ সব সংরক্ষিত fingerprint-এর সাথে compare করা হয়
3. Exact match: 100% identical hash
4. Similar images: Hash অনুরূপ কিন্তু identical নয়
""", body_style))

story.append(Paragraph("5.2 Perceptual Hashing - পারসেপচুয়াল হ্যাশিং", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Perceptual hash ইমেজের visual content দেখে hash তৈরি করে। ইমেজ resize বা compress হলেও একই hash থাকে।
""", body_style))

story.append(Paragraph("<b>Algorithms:</b>", body_style))
story.append(Paragraph("• <b>pHash (Perceptual Hash):</b> DCT-based, robust to scaling", bullet_style))
story.append(Paragraph("• <b>aHash (Average Hash):</b> Simple, fast comparison", bullet_style))
story.append(Paragraph("• <b>dHash (Difference Hash):</b> Gradient-based detection", bullet_style))

story.append(Paragraph("5.3 Similarity Calculation - সিমিলারিটি ক্যালকুলেশন", h2_style))
story.append(Paragraph("""
<b>Hamming Distance:</b> দুটি hash-এর মধ্যে কতগুলো bit আলাদা তা গণনা করা হয়।
""", body_style))

story.append(Paragraph("<b>উদাহরণ:</b>", body_style))
story.append(Paragraph("Hash 1: 1011010110...", code_style))
story.append(Paragraph("Hash 2: 1010010110...", code_style))
story.append(Paragraph("Difference: 1 bit (99.5% similar)", code_style))

story.append(Paragraph("<b>Similarity Thresholds:</b>", body_style))
story.append(Paragraph("• 100% = Exact duplicate", bullet_style))
story.append(Paragraph("• 90-99% = Minor edits (crop, filter)", bullet_style))
story.append(Paragraph("• 70-89% = Similar image", bullet_style))
story.append(Paragraph("• <70% = Different image", bullet_style))

# ========== SECTION 6: FIREBASE ==========
story.append(Paragraph("6. Firebase Integration (ফায়ারবেস ইন্টিগ্রেশন)", h1_style))

story.append(Paragraph("6.1 Firebase Analytics - অ্যানালিটিক্স", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Firebase Analytics ইউজার আচরণ ট্র্যাক করতে ব্যবহৃত হয়। কে কোন পেজ দেখছে, কোন বাটন ক্লিক করছে তা জানা যায়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• login - ইউজার লগইন ট্র্যাক", bullet_style))
story.append(Paragraph("• image_upload - ইমেজ আপলোড ট্র্যাক", bullet_style))
story.append(Paragraph("• image_protect - প্রোটেকশন ট্র্যাক", bullet_style))
story.append(Paragraph("• image_detect - ডিটেকশন ট্র্যাক", bullet_style))

story.append(Paragraph("6.2 Firebase Firestore - ফায়ারস্টোর", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Firestore হলো NoSQL cloud database যা real-time data sync করে।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• Real-time user presence tracking", bullet_style))
story.append(Paragraph("• Online user count display", bullet_style))
story.append(Paragraph("• Activity logging", bullet_style))

story.append(Paragraph("<b>Data Structure:</b>", body_style))
story.append(Paragraph("Collection: 'presence'", code_style))
story.append(Paragraph("Document: userId", code_style))
story.append(Paragraph("Fields: { name, email, status, lastSeen, currentPage }", code_style))

story.append(Paragraph("6.3 Firebase Storage - স্টোরেজ", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Firebase Storage হলো cloud file storage যা images, videos সংরক্ষণ করতে ব্যবহৃত হয়।
""", body_style))

story.append(Paragraph("<b>TraceGuard-এ এর কাজ:</b>", body_style))
story.append(Paragraph("• ইমেজ ফাইল সংরক্ষণ", bullet_style))
story.append(Paragraph("• Secure download URLs", bullet_style))
story.append(Paragraph("• Automatic backup", bullet_style))

# ========== SECTION 7: PWA ==========
story.append(Paragraph("7. Progressive Web App (PWA) - প্রগ্রেসিভ ওয়েব অ্যাপ", h1_style))

story.append(Paragraph("7.1 Service Worker - সার্ভিস ওয়ার্কার", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> Service Worker হলো একটি JavaScript ফাইল যা ব্রাউজারে background-এ চলে। এটা offline capability দেয়।
""", body_style))

story.append(Paragraph("<b>কিভাবে কাজ করে:</b>", body_style))
story.append(Paragraph("""
1. প্রথম ভিজিটে Service Worker install হয়
2. Important files cache হয়
3. পরবর্তী ভিজিটে cache থেকে লোড হয়
4. Offline-এও অ্যাপ কাজ করে
""", body_style))

story.append(Paragraph("7.2 Manifest.json", h2_style))
story.append(Paragraph("""
<b>এটা কি?</b> manifest.json ফাইল PWA-এর configuration ধারণ করে।
""", body_style))

story.append(Paragraph("<b>বিষয়বস্তু:</b>", body_style))
story.append(Paragraph("• App name: TraceGuard AI", bullet_style))
story.append(Paragraph("• Icons: logo.png (various sizes)", bullet_style))
story.append(Paragraph("• Theme color: #7c3aed", bullet_style))
story.append(Paragraph("• Display mode: standalone", bullet_style))

# ========== SECTION 8: SECURITY ==========
story.append(Paragraph("8. Security Implementation (নিরাপত্তা বাস্তবায়ন)", h1_style))

story.append(Paragraph("8.1 HTTPS - এইচটিটিপিএস", h2_style))
story.append(Paragraph("""
<b>কিভাবে কাজ করে:</b> সব communication encrypted হয়। তৃতীয় পক্ষ ডেটা পড়তে পারে না।
""", body_style))

story.append(Paragraph("8.2 Input Validation - ইনপুট ভ্যালিডেশন", h2_style))
story.append(Paragraph("<b>TraceGuard-এ:</b>", body_style))
story.append(Paragraph("• Email format check: regex validation", bullet_style))
story.append(Paragraph("• Password strength: minimum 6 characters", bullet_style))
story.append(Paragraph("• File type check: JPEG, PNG, WebP only", bullet_style))
story.append(Paragraph("• File size limit: maximum 10MB", bullet_style))

story.append(Paragraph("8.3 CORS Protection - কোর্স প্রোটেকশন", h2_style))
story.append(Paragraph("""
<b>কিভাবে কাজ করে:</b> শুধু authorized domains থেকে API request গ্রহণ করা হয়।
""", body_style))

# ========== SECTION 9: DEPLOYMENT ==========
story.append(Paragraph("9. Deployment Architecture (ডিপ্লয়মেন্ট আর্কিটেকচার)", h1_style))

story.append(Paragraph("9.1 Vercel Deployment", h2_style))
story.append(Paragraph("""
<b>কিভাবে কাজ করে:</b>
""", body_style))
story.append(Paragraph("""
1. GitHub repository থেকে code pull হয়
2. Automatic build process শুরু হয়
3. npm run build execute হয়
4. Edge network-এ deploy হয়
5. CDN-এর মাধ্যমে global distribution হয়
""", body_style))

story.append(Paragraph("9.2 Environment Variables", h2_style))

env_data = [
    ['Variable', 'Purpose', 'Example'],
    ['DATABASE_URL', 'Database connection', 'file:./dev.db'],
    ['NEXTAUTH_SECRET', 'Session encryption', 'random-32-char-string'],
    ['NEXTAUTH_URL', 'App URL', 'https://traceguard.ai'],
    ['FIREBASE_API_KEY', 'Firebase auth', 'AIzaSy...'],
    ['FIREBASE_PROJECT_ID', 'Firebase project', 'traceguard-ai-xxx'],
]

env_table = Table(env_data, colWidths=[100, 100, 170])
env_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), DARK),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, -1), 'Bengali' if font_registered else 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, DARK),
    ('BACKGROUND', (0, 1), (-1, -1), white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
]))

story.append(Spacer(1, 10))
story.append(env_table)

# Footer
story.append(Spacer(1, 30))
story.append(Paragraph("© 2024 TraceGuard AI - Technical Documentation", ParagraphStyle('Footer', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=9, textColor=SECONDARY, alignment=TA_CENTER)))

# Build PDF
doc.build(story)
print("Technical Guide PDF generated successfully!")
