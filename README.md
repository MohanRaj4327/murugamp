# Muruga MP Academy — Student-First Website Demo

> **Independent Concept Demo** created for Google Antigravity, based on verified public research of educator **Muruga MP** ("Open Your Mind With Muruga MP" / "Muruga MP Academy").

---

## 🌟 Overview & Highlights

This project addresses student navigation pain points discovered during an extensive public audit of Muruga MP's educational channels. It unifies **529 verified video lessons** and **31 public playlists** into an ultra-fast, mobile-first, searchable educational platform.

### Key Pedagogical & UX Features
- **Student-First Architecture:** Clear separation between core academic lessons (Classes 9, 10, 11, 12), Board Exam centum challenges, competitive entrance prep (NEET/JEE), and time-sensitive career guidance (TNEA).
- **Verified Brand Motto:** Showcases Muruga MP’s signature spoken closing reminder: *"Help Others With a Smile"* — *"Learn with clarity. Grow with confidence. Help others along the way."*
- **Instant Client-Side Search:** Real-time search across titles, chapters, numerical topics, and playlist names with sub-millisecond response.
- **Multi-Dimensional Filters:** Combined filtering by Class (9, 10, 11, 12), Board (CBSE/NCERT, Tamil Nadu Samacheer Kalvi, NEET/JEE), and Format (Concepts, Worked PYQs, One-Shot Marathons, Formula Shortcuts).
- **Time-Sensitive Caution Badges:** Automatic warning banners on higher-education admissions guides prompting students to verify against live official government notices (`tneaonline.org`).
- **Interactive In-App Modal Player:** Embedded YouTube video player with direct external YouTube links, chapter sequence breadcrumbs, and related unit lessons.
- **Saved Bookmarks System:** Offline persistent `localStorage` bookmarking for quick revision without needing a user account or database.
- **Tuition Batch 5 Hub:** Real, verified admissions details for October 2026 Class 12 CBSE & State Board batches with direct WhatsApp link to `9043568854`.

---

## 🚀 How to Run the Website Locally

This front-end application is lightweight, dependency-free, and runs instantly in any modern browser.

### Option 1: Using Python HTTP Server (Recommended)
Open a terminal in the project directory and run:
```bash
python -m http.server 3000
```
Then navigate to: **`http://localhost:3000`** in your browser.

### Option 2: Using Node.js / npx serve
```bash
npx serve -l 3000 .
```

### Option 3: Direct File Browser Preview
Double-click `index.html` or open it directly in Chrome, Firefox, or Edge. (The app includes automatic offline caching for direct file access).

---

## 📊 Updating the Playlist Inventory

The application is powered by `data/playlist-inventory.csv` and `data/playlist-inventory.json`.

### Schema Details
Each row in `data/playlist-inventory.csv` represents one verified video and contains:
```
playlist_title, playlist_url, playlist_id, video_title, video_url, video_id, class_level, syllabus, subject, chapter, topic, exam_goal, content_format, language, published_date_if_visible, duration_if_visible, verification_status, source_url, notes
```

### Steps to Add New Videos or Batches:
1. Open `data/playlist-inventory.csv`.
2. Append a new row with verified details:
   - Must contain an exact 11-character YouTube `video_id` (e.g., `gxss05PxO8c`).
   - Leave unverified fields blank; do not fabricate video IDs.
3. Re-generate the JSON cache by running:
   ```bash
   python scratch/build_inventory.py
   ```
4. Refresh your browser to see the updated lessons immediately.

---

## 🔍 Verified Source Log & Credentials

| Channel / Platform | Verified Handle / URL |
| :--- | :--- |
| **YouTube Channel** | [Open Your Mind With Muruga MP](https://www.youtube.com/channel/UCVJc7bS5lP8OrZGd7vs_yHw) (`@MurugaMP`) |
| **Official Website** | [openyourmindwithmurugamp.com](https://www.openyourmindwithmurugamp.com/) |
| **Telegram Community** | [@OpenYourMindWithMurugaMP](https://t.me/s/OpenYourMindWithMurugaMP) (16.7K members) |
| **Android App** | [Google Play Store](https://play.google.com/store/apps/details?id=com.carveit.a2ztechvalley) |
| **WhatsApp Line** | `+91 9043568854` (Official Muruga MP Academy) |

---

## ⚖️ Disclaimer
*This website is an independent concept demonstration developed for Google Antigravity. It is not an official portal of Muruga MP Academy. All video materials and trademarks belong to Muruga MP.*
