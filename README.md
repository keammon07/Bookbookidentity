# Book Identity v2.0 Alpha

เวอร์ชันถัดไปของ Book Identity ที่ปรับประสบการณ์ให้เหมือนกำลังอ่านหนังสือจริงมากขึ้น

## เพิ่มจาก v1.x

- ปกหนังสือแบบใหม่
- Chapter ภาษาไทยครบ 8 บท
- Page number
- Bookmark
- Page-turn transition
- ตัวเลือกแบบเส้นข้อความบนหน้ากระดาษ
- Hidden weighted scoring
- Result layout ใหม่
- Bookshelf DNA
- ดาวน์โหลดการ์ดผลลัพธ์ 1080×1920
- รองรับ Web Share API
- เอาปุ่มไป Naiin ออกแล้ว
- พร้อมใช้กับ GitHub Pages

## วิธีใช้งาน

1. แตกไฟล์ ZIP
2. เปิด `index.html` เพื่อทดสอบ
3. ถ้าจะอัป GitHub ให้เอาไฟล์ทั้งหมดในโฟลเดอร์นี้ไปแทนไฟล์เดิม
4. ต้องให้ `index.html` อยู่ที่หน้าแรกของ Repository

## โครงสร้าง

```text
book-identity-v2.0-alpha/
├── index.html
├── css/
│   ├── style.css
│   ├── animation.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── scoring.js
│   ├── ui.js
│   └── result.js
├── data/
│   ├── characters.js
│   └── questions.js
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── README.md
```

## แก้ไขคำถาม

แก้ที่ `data/questions.js`

## แก้ไขตัวตนและหมวดหนังสือ

แก้ที่ `data/characters.js`
