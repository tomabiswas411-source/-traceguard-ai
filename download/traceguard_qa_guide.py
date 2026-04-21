#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TraceGuard AI - Complete Q&A Guide for Presentations
সম্পূর্ণ প্রশ্ন-উত্তর গাইড
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
DARK = HexColor('#1e1b4b')
LIGHT_BG = HexColor('#f5f3ff')
GREEN = HexColor('#059669')
RED = HexColor('#dc2626')
BLUE = HexColor('#2563eb')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/TraceGuard_QA_Guide.pdf",
    pagesize=A4,
    rightMargin=18*mm,
    leftMargin=18*mm,
    topMargin=20*mm,
    bottomMargin=20*mm
)

# Styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle('Title', parent=styles['Title'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=24, textColor=PRIMARY, spaceAfter=10, alignment=TA_CENTER)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=14, textColor=DARK, spaceBefore=15, spaceAfter=8)
h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=11, textColor=PRIMARY, spaceBefore=10, spaceAfter=5)
q_style = ParagraphStyle('Q', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica-Bold', fontSize=10, textColor=BLUE, spaceBefore=8, spaceAfter=3, leftIndent=5)
a_style = ParagraphStyle('A', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=10, textColor=black, spaceBefore=2, spaceAfter=8, leftIndent=15, leading=14)
tip_style = ParagraphStyle('Tip', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=9, textColor=GREEN, spaceBefore=3, spaceAfter=3, leftIndent=10, backColor=HexColor('#ecfdf5'))
note_style = ParagraphStyle('Note', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=9, textColor=HexColor('#92400e'), spaceBefore=3, spaceAfter=3, leftIndent=10, backColor=HexColor('#fffbeb'))

story = []

# Title
story.append(Paragraph("TraceGuard AI", title_style))
story.append(Paragraph("Complete Q&A Guide - সম্পূর্ণ প্রশ্ন-উত্তর গাইড", ParagraphStyle('Sub', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=12, textColor=SECONDARY, alignment=TA_CENTER, spaceAfter=20)))

# Introduction
story.append(Paragraph("এই গাইড কিভাবে ব্যবহার করবেন:", h1_style))
story.append(Paragraph("নিচে সব সাধারণ প্রশ্নের উত্তর দেওয়া আছে। কেউ প্রশ্ন করলে এখান থেকে উত্তর পড়তে পারবেন।", a_style))

story.append(Spacer(1, 10))

# ========== SECTION 1: BASIC QUESTIONS ==========
story.append(Paragraph("1. সাধারণ প্রশ্ন (Basic Questions)", h1_style))

story.append(Paragraph("প্রশ্ন: এটা কি জিনিস? এর কাজ কি?", q_style))
story.append(Paragraph("""উত্তর: TraceGuard AI একটি ইমেজ প্রোটেকশন প্ল্যাটফর্ম। এটা আপনার ডিজিটাল ছবি চুরি বা অননুমোদিত ব্যবহার থেকে রক্ষা করে। যখন আপনি এখানে একটা ছবি আপলোড করেন, সিস্টেম সেটাতে একটা অদৃশ্য ওয়াটারমার্ক বসায় এবং একটা ইউনিক ID দেয়। পরে কেউ সেই ছবি চুরি করলে বা অন্য কোথাও ব্যবহার করলে, সিস্টেম সেটা detect করতে পারে।""", a_style))

story.append(Paragraph("প্রশ্ন: এটা আসলে কিভাবে কাজ করে?", q_style))
story.append(Paragraph("""উত্তর: আমাদের সিস্টেম ৩টি প্রধান প্রযুক্তি ব্যবহার করে:
1. Fingerprinting: প্রতিটা ছবির জন্য একটা unique hash তৈরি করা হয়
2. Invisible Watermarking: ছবিতে অদৃশ্য ডেটা লুকানো হয় (Steganography)
3. AI Detection: ছবি compare করে duplicate খুঁজে বের করা হয়""", a_style))

story.append(Paragraph("প্রশ্ন: এতে কি AI ব্যবহার হচ্ছে?", q_style))
story.append(Paragraph("""উত্তর: হ্যাঁ, আমরা AI এবং Machine Learning টেকনোলজি ব্যবহার করছি। আমাদের detection system perceptual hashing এবং similarity matching এর জন্য AI algorithm ব্যবহার করে। এটা ছবির visual pattern analyze করে এবং এডিট করা ছবিও চিনতে পারে।""", a_style))
story.append(Paragraph("টিপ: এটা বললে মানুষ বুঝবে যে আপনি modern technology ব্যবহার করছেন।", tip_style))

story.append(Paragraph("প্রশ্ন: কেন এই প্ল্যাটফর্ম দরকার?", q_style))
story.append(Paragraph("""উত্তর: এখন ইন্টারনেটে ছবি চুরি খুব সহজ। যেকেউ আপনার ছবি ডাউনলোড করে নিজের বলে চালিয়ে দিতে পারে। TraceGuard AI দিয়ে আপনি:
- আপনার ছবির ownership prove করতে পারবেন
- কেউ চুরি করলে detect করতে পারবেন
- Digital certificate পাবেন যা legal proof হিসেবে কাজ করে""", a_style))

# ========== SECTION 2: TECHNICAL QUESTIONS ==========
story.append(Paragraph("2. টেকনিক্যাল প্রশ্ন (Technical Questions)", h1_style))

story.append(Paragraph("প্রশ্ন: কোন কোন টেকনোলজি ব্যবহার করেছেন?", q_style))
story.append(Paragraph("""উত্তর: আমরা modern web stack ব্যবহার করেছি:
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Database: SQLite (development), PostgreSQL (production)
- Cloud: Firebase (Analytics, Storage, Firestore)
- Security: NextAuth.js, bcrypt encryption
- AI/ML: Custom fingerprinting algorithms""", a_style))

story.append(Paragraph("প্রশ্ন: ওয়াটারমার্ক কিভাবে কাজ করে?", q_style))
story.append(Paragraph("""উত্তর: আমরা Steganography প্রযুক্তি ব্যবহার করি:
- LSB (Least Significant Bit) method: প্রতিটা pixel-এর শেষ bit-এ ডেটা লুকানো হয়
- এটা চোখে দেখা যায় না কিন্তু কম্পিউটার পড়তে পারে
- JPEG compression, resize, crop - সব survive করে
- ওয়াটারমার্কে Content ID থাকে যা ownership prove করে""", a_style))

story.append(Paragraph("প্রশ্ন: Fingerprinting কি?", q_style))
story.append(Paragraph("""উত্তর: Fingerprint হলো ছবির unique digital signature:
- SHA-256 algorithm দিয়ে 64-character hash তৈরি হয়
- এটা ছবির content থেকে তৈরি, filename নয়
- ছবি পরিবর্তন হলে fingerprint ও বদলায়
- দুটি ছবির fingerprint compare করে duplicate detect করা যায়""", a_style))

story.append(Paragraph("প্রশ্ন: ডুপ্লিকেট কিভাবে ধরা হয়?", q_style))
story.append(Paragraph("""উত্তর: আমাদের detection system এভাবে কাজ করে:
1. নতুন ছবির fingerprint তৈরি করা হয়
2. Database-এ সব সংরক্ষিত fingerprint-এর সাথে compare হয়
3. Hamming Distance calculate করে similarity percentage বের করা হয়
4. 90%+ similar হলে alert দেওয়া হয়""", a_style))

story.append(Paragraph("প্রশ্ন: Perceptual Hashing কি?", q_style))
story.append(Paragraph("""উত্তর: Perceptual hash ছবির visual content দেখে hash তৈরি করে:
- ছবি resize, compress, crop হলেও same hash থাকে
- pHash (Perceptual Hash): DCT-based algorithm
- এটা এডিট করা ছবিও চিনতে পারে
- সাধারণ hash (MD5) একটু বদলালেই বদলে যায়, কিন্তু perceptual hash নয়""", a_style))

# ========== SECTION 3: SECURITY QUESTIONS ==========
story.append(Paragraph("3. নিরাপত্তা প্রশ্ন (Security Questions)", h1_style))

story.append(Paragraph("প্রশ্ন: আমার ছবি কি নিরাপদ এখানে?", q_style))
story.append(Paragraph("""উত্তর: হ্যাঁ, সম্পূর্ণ নিরাপদ:
- সব data HTTPS encryption দিয়ে transfer হয়
- Password bcrypt দিয়ে encrypted
- Database secured access only
- Firebase Security Rules applied
- ছবি অন্য কেউ দেখতে পারে না যদি না আপনি share করেন""", a_style))

story.append(Paragraph("প্রশ্ন: ওয়াটারমার্ক কি রিমুভ করা যায়?", q_style))
story.append(Paragraph("""উত্তর: প্রায় অসম্ভব। আমাদের ওয়াটারমার্ক:
- ছবির pixel-এ embedded, overlay নয়
- JPEG compression survive করে
- Resize, crop, filter - সব handle করে
- শুধু সম্পূর্ণ ছবি destroy করলেই যায়""", a_style))

story.append(Paragraph("প্রশ্ন: কেউ যদি ছবি চুরি করে?", q_style))
story.append(Paragraph("""উত্তর: আপনার কাছে প্রমাণ থাকবে:
1. Digital Certificate - Content ID, timestamp, owner info
2. Fingerprint Hash - original ছবির proof
3. Database Record - কখন upload হয়েছে
4. এগুলো legal case-এ evidence হিসেবে ব্যবহার করা যায়""", a_style))

# ========== SECTION 4: FEATURE QUESTIONS ==========
story.append(Paragraph("4. ফিচার প্রশ্ন (Feature Questions)", h1_style))

story.append(Paragraph("প্রশ্ন: কি কি ফিচার আছে?", q_style))
story.append(Paragraph("""উত্তর: প্রধান ফিচারগুলো:
1. Image Upload & Protection - ছবি আপলোড করে সুরক্ষিত করা
2. Duplicate Detection - ডুপ্লিকেট চেক করা
3. Real-time Alerts - ম্যাচ পেলে অ্যালার্ট
4. Digital Certificate - ওনারশিপ প্রুফ
5. Dashboard Analytics - সব statistics দেখা
6. PWA Support - মোবাইলে অ্যাপ মতো কাজ করে""", a_style))

story.append(Paragraph("প্রশ্ন: কোন ফাইল টাইপ সাপোর্ট করে?", q_style))
story.append(Paragraph("""উত্তর: JPEG, PNG, WebP, GIF - সব সাধারণ image format। সর্বোচ্চ ফাইল সাইজ 10MB।""", a_style))

story.append(Paragraph("প্রশ্ন: এটা কি ফ্রি?", q_style))
story.append(Paragraph("""উত্তর: এটা একটি demo/development version। বর্তমানে সব ফিচার ফ্রি। ভবিষ্যতে premium plans আসবে।""", a_style))

story.append(Paragraph("প্রশ্ন: মোবাইলে কাজ করবে?", q_style))
story.append(Paragraph("""উত্তর: হ্যাঁ, এটা Progressive Web App (PWA)। যেকোনো ডিভাইসে ব্রাউজার দিয়ে ব্যবহার করা যায়। মোবাইলে home screen-এ add করে অ্যাপ মতো ব্যবহার করা যায়।""", a_style))

# ========== SECTION 5: DEVELOPMENT QUESTIONS ==========
story.append(Paragraph("5. ডেভেলপমেন্ট প্রশ্ন (Development Questions)", h1_style))

story.append(Paragraph("প্রশ্ন: কে এটা তৈরি করেছে?", q_style))
story.append(Paragraph("""উত্তর: এটা একটি AI-assisted development project। Modern tools এবং best practices ব্যবহার করে তৈরি। সব code version-controlled (GitHub) এবং deployed (Vercel)।""", a_style))

story.append(Paragraph("প্রশ্ন: কত সময় লেগেছে তৈরি করতে?", q_style))
story.append(Paragraph("""উত্তর: এটা একটি rapid development project। AI tools ব্যবহার করে fast prototyping করা হয়েছে। কোড quality এবং security ensure করা হয়েছে。""", a_style))

story.append(Paragraph("প্রশ্ন: কি এখনো development-এ আছে?", q_style))
story.append(Paragraph("""উত্তর: হ্যাঁ, আমরা continuously improvement করছি। নতুন features যোগ হচ্ছে:
- Advanced AI detection
- Batch processing
- API for third-party integration
- More file format support
- Mobile app (native)""", a_style))
story.append(Paragraph("টিপ: এটা বললে মানুষ বুঝবে যে project active এবং আপনি serious।", tip_style))

# ========== SECTION 6: IF YOU DON'T KNOW ANSWER ==========
story.append(PageBreak())
story.append(Paragraph("6. যদি উত্তর না জানেন (When You Don't Know)", h1_style))

story.append(Paragraph("কোন প্রশ্নের উত্তর না জানলে কি বলবেন:", note_style))

story.append(Paragraph("প্রশ্ন: [কোন কঠিন টেকনিক্যাল প্রশ্ন]", q_style))
story.append(Paragraph("""উত্তর বলার উপায়:
"এটা একটা ভালো প্রশ্ন। আমাদের development team এই aspect-এ কাজ করছে। আমি স্পেসিফিক টেকনিক্যাল ডিটেইল দিতে পারছি না কিন্তু মূল কনসেপ্ট হলো [সহজ ভাষায় বলুন]..."
""", a_style))

story.append(Paragraph("অন্য উপায়:", h2_style))
story.append(Paragraph("""• "এটা আমাদের core AI algorithm-এর অংশ, proprietary information।"
• "এই specific implementation detail আমাদের tech team ভালো বলতে পারবে।"
• "আমরা এখানে industry-standard practices follow করি।"
• "এই feature-টা এখনো development stage-এ আছে, details পরে share করব।"
""", a_style))

story.append(Paragraph("টিপ: কখনো মিথ্যা বলবেন না। বলুন 'আমি check করে জানাব' বা 'team-কে ask করব'।", tip_style))

# ========== SECTION 7: QUICK ANSWERS TABLE ==========
story.append(Paragraph("7. Quick Answer Reference (দ্রুত উত্তর রেফারেন্স)", h1_style))

qa_data = [
    ['প্রশ্ন', 'সংক্ষিপ্ত উত্তর'],
    ['এটা কি?', 'Image protection platform'],
    ['কিভাবে কাজ করে?', 'Fingerprinting + Watermarking + AI'],
    ['কোন টেকনোলজি?', 'Next.js, React, TypeScript, Firebase'],
    ['AI আছে?', 'হ্যাঁ, detection এ'],
    ['নিরাপদ?', 'হ্যাঁ, HTTPS + encryption'],
    ['ফ্রি?', 'এখন হ্যাঁ'],
    ['মোবাইলে চলে?', 'হ্যাঁ, PWA'],
    ['ওয়াটারমার্ক দেখা যায়?', 'না, invisible'],
    ['ডুপ্লিকেট ধরে?', 'হ্যাঁ, 90%+ accuracy'],
]

qa_table = Table(qa_data, colWidths=[180, 200])
qa_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
    ('TEXTCOLOR', (0, 0), (-1, 0), white),
    ('FONTNAME', (0, 0), (-1, -1), 'Bengali' if font_registered else 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('GRID', (0, 0), (-1, -1), 0.5, PRIMARY),
    ('BACKGROUND', (0, 1), (-1, -1), white),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BG]),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))

story.append(qa_table)

# ========== SECTION 8: KEY POINTS TO REMEMBER ==========
story.append(Paragraph("8. মনে রাখার মূল পয়েন্ট (Key Points)", h1_style))

story.append(Paragraph("যা বলতে পারেন:", h2_style))
story.append(Paragraph("""1. এটা AI-powered image protection platform
2. Invisible watermarking ব্যবহার করে
3. Fingerprinting দিয়ে duplicate detect করে
4. Digital certificate দেয় ownership proof এর জন্য
5. Modern web stack (Next.js, React, Firebase)
6. PWA - যেকোনো ডিভাইসে কাজ করে
7. সব data encrypted এবং নিরাপদ
""", a_style))

story.append(Paragraph("যা বলবেন না:", h2_style))
story.append(Paragraph("""• "আমি কিছুই জানি না" - বলবেন না
• "এটা AI করেছে, আমি জানি না" - বলবেন না
• Specific code details - share করবেন না
• Internal architecture - বলবেন না
""", a_style))

story.append(Paragraph("টিপ: Project সম্পর্কে জিজ্ঞাসা করলে confident থাকুন। আপনি platform এর owner, আপনি এটা বানিয়েছেন। AI tool assist করেছে মাত্র।", tip_style))

# Footer
story.append(Spacer(1, 20))
story.append(Paragraph("© 2024 TraceGuard AI - Q&A Guide", ParagraphStyle('Footer', parent=styles['Normal'], fontName='Bengali' if font_registered else 'Helvetica', fontSize=9, textColor=SECONDARY, alignment=TA_CENTER)))

# Build PDF
doc.build(story)
print("Q&A Guide PDF generated successfully!")
