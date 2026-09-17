# EAFC Skill Hub

เว็บสอนสกิลมูฟและปุ่มควบคุม EA FC 27 สองภาษา (ไทย/อังกฤษ) เลือกจอยที่ใช้ครั้งเดียว แล้วทุกท่าในเว็บจะแสดงปุ่มตามจอยนั้น

**เว็บจริง:** https://josiamu.github.io/eafc27/

- ทุกท่ามีลำดับปุ่ม ภาพนักเตะขยับบนสนาม และเดินดูทีละจังหวะได้
- **โหมดฝึก:** เสียบจอยแล้วกดตาม เว็บบอกว่าทำถูกไหม กดปุ่ม Menu บนจอยเพื่อเริ่มหรือลองใหม่ได้
- รองรับ PlayStation, Xbox และ Nintendo Switch แก้หน้าตาปุ่มและผูกปุ่มเองได้
- ค่าที่เลือก (จอย ภาษา ธีม) เก็บในเบราว์เซอร์ ไม่ต้องสมัครสมาชิก

เว็บแฟนเมด ไม่เกี่ยวข้องกับ EA SPORTS

## เริ่มพัฒนา

CI ใช้ Node.js 24 เครื่องที่พัฒนาควรใช้รุ่นเดียวกัน

```bash
npm ci
npm run dev     # http://localhost:3000/eafc27/  (มี /eafc27 ตอน dev ด้วย)
npm run build   # static export ลง out/ และตรวจข้อมูลทุกท่ากับปุ่มควบคุม
npm run lint
```

เปิดจากมือถือในวง LAN เดียวกันได้ที่ `http://<IP ของเครื่อง>:3000/eafc27/`

## โครงสร้าง

| ที่ | มีอะไร |
|---|---|
| `src/data/moves/*.json` | ข้อมูลท่า หนึ่งไฟล์ต่อหนึ่งท่า |
| `src/data/schema.ts` | schema ของท่า ถ้าข้อมูลผิด build จะไม่ผ่าน |
| `src/data/controls/*.json` | ปุ่มควบคุมในหน้า `/controls` หนึ่งไฟล์ต่อหนึ่งหมวด ตรวจด้วย `src/data/control-schema.ts` |
| `src/controller/` | ชื่อปุ่มกลาง preset จอย การอ่านจอย และตัวตรวจท่าในโหมดฝึก |
| `src/components/move/` | แถบลำดับปุ่ม สนาม ภาพเคลื่อนไหว และโหมดฝึก |
| `src/i18n/dictionaries/` | ข้อความบนเว็บ `th.ts` เป็นต้นแบบ ส่วน `en.ts` ถูกตรวจ type ให้ครบตาม |
| `src/app/` | หน้าเว็บ (`/[locale]/...`), การ์ดแชร์ `og.png`, `sitemap.xml` และหน้า 404 |
| `PLAN.md` | แผนงานและการตัดสินใจที่ผ่านมา |

## เพิ่มหรือแก้ท่า

1. ก๊อปไฟล์ท่าที่มีอยู่ เช่น `src/data/moves/elastico.json` ตั้งชื่อไฟล์ให้ตรงกับ `slug`
2. ปุ่มใช้ชื่อกลางใน `src/controller/buttons.ts` เช่น `SHOULDER_R1` ห้ามเขียน R1 หรือ RB ตรง ๆ
3. ทิศอนาล็อกนับจากทางที่นักเตะหัน `up` คือไปข้างหน้า
4. ใส่ `sources` ทุกแหล่งที่ใช้ ตั้ง `verified: true` ได้เฉพาะตอนที่อย่างน้อยสองแหล่งบอกดาวและปุ่มตรงกัน
5. รัน `npm run build` ให้ผ่าน

ถ้าใช้ Claude Code มี skill `add-move` ที่ทำขั้นตอนนี้ให้ รายละเอียดกฎทั้งหมดอยู่ใน `CLAUDE.md`

## Deploy

push ขึ้น `main` แล้ว GitHub Actions (`.github/workflows/deploy.yml`) จะ lint, build และ deploy ขึ้น GitHub Pages ให้เอง

## แจ้งข้อมูลผิด

เปิด issue ที่ https://github.com/josiamu/eafc27/issues บอกชื่อท่า จอยที่ใช้ และสิ่งที่เกิดขึ้นในเกม

## เครดิต

ฟอนต์ [Kanit](https://github.com/cadsondemak/kanit) ใช้ทำการ์ดแชร์ อยู่ภายใต้ SIL Open Font License ดู `src/assets/fonts/OFL.txt`
