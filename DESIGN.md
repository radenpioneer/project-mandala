---
name: Project Mandala
description: An editorial data desk for transparent, privacy-aware survey reporting.
colors:
  tinta-gelap: "#162024"
  teal-musyawarah: "#00665b"
  kertas-hangat: "#f6f1e8"
  surface: "#ffffff"
  muted: "#65716a"
  line: "#d9ddd5"
  soft-fill: "#edf0eb"
  notice-paper: "#fff9eb"
  notice-line: "#dfcaa0"
  candidate-teal: "#087f6c"
  candidate-ochre: "#ca8a2d"
  candidate-blue: "#285f75"
  candidate-plum: "#8d668b"
  candidate-olive: "#6f8d49"
  candidate-terracotta: "#b75b4b"
  unavailable: "#aeb7b0"
typography:
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  panel: "4px"
  control: "8px"
  card: "12px"
  overlay: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  section: "28px"
  overlay: "30px"
components:
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "42px"
  tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tinta-gelap}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "42px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.tinta-gelap}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tinta-gelap}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 34px 0 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.soft-fill}"
    textColor: "{colors.muted}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "7px 10px"
  data-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tinta-gelap}"
    rounded: "{rounded.panel}"
    padding: "30px"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tinta-gelap}"
    rounded: "{rounded.overlay}"
    padding: "30px"
---

# Design System: Project Mandala

## Overview

**Creative North Star: "Meja Redaksi Data"**

Project Mandala terasa seperti meja redaksi yang mengolah data publik dengan tenang: editorial, analitis, dan hangat. Latar berkarakter kertas menahan ketegangan visual, tinta gelap menjaga keterbacaan, dan teal dipakai sebagai penanda tindakan serta konteks—bukan sebagai dekorasi yang mendominasi data.

Sistem ini padat namun tidak gaduh. Struktur datang dari tab, garis, jarak, pengelompokan, dan hierarki angka; bayangan hanya membantu lapisan yang benar-benar terangkat. Setiap pilihan visual harus memperkuat transparansi dan kehati-hatian, tanpa terasa seperti papan skor malam pemilu, dashboard fintech, atau portal resmi pemerintah.

**Key Characteristics:**

- Editorial dan chart-first, dengan data sebagai pusat perhatian.
- Hangat dan manusiawi tanpa mengurangi ketelitian analitis.
- Transparan mengenai status, keterbatasan, dan data yang ditahan.
- Padat, adaptif, dan dapat dipindai pada desktop maupun mobile.
- Aksen visual terkendali; warna kandidat tetap setara dan fungsional.

## Colors

Palet menggabungkan kertas hangat, tinta hijau-hitam, teal editorial, dan netral kehijauan; Spektrum Pembeda menyediakan enam warna kandidat yang setara tanpa memberi satu kandidat bobot merek.

### Primary

- **Teal Musyawarah** (#00665b): Menandai tindakan, tautan, state terpilih, nilai penting, dan konteks yang dapat ditindaklanjuti.

### Secondary

- **Candidate Teal** (#087f6c): Warna pertama Spektrum Pembeda.
- **Candidate Ochre** (#ca8a2d): Warna kedua Spektrum Pembeda.
- **Candidate Blue** (#285f75): Warna ketiga Spektrum Pembeda.
- **Candidate Plum** (#8d668b): Warna keempat Spektrum Pembeda.
- **Candidate Olive** (#6f8d49): Warna kelima Spektrum Pembeda.
- **Candidate Terracotta** (#b75b4b): Warna keenam Spektrum Pembeda. Seluruh urutan hanya membedakan seri data atau kandidat dan tidak menyiratkan dukungan.

### Neutral

- **Tinta Gelap** (#162024): Teks utama, merek, dan kontras paling kuat.
- **Kertas Hangat** (#f6f1e8): Kanvas halaman Varian B dan sumber karakter editorialnya.
- **Surface** (#ffffff): Panel data, tab aktif, input, kartu, dan dialog.
- **Muted** (#65716a): Metadata, microcopy, timestamp, dan informasi sekunder.
- **Line** (#d9ddd5): Pemisah struktural dan batas panel yang tenang.
- **Soft Fill** (#edf0eb): Track chart, state pasif, dan kelompok tonal ringan.
- **Unavailable** (#aeb7b0): Data yang ditahan atau belum cukup; selalu didampingi label tekstual.
- **Notice Paper** (#fff9eb): Latar untuk peringatan metodologis.
- **Notice Line** (#dfcaa0): Batas untuk peringatan metodologis.

### Named Rules

**The Quiet Accent Rule.** Teal menandai aksi, pilihan, atau konteks penting; jangan menyebarkannya sebagai dekorasi di seluruh layar.

**The Candidate Parity Rule.** Semua warna kandidat memiliki bobot visual yang setara dan tidak pernah dipakai sebagai warna merek atau sinyal dukungan.

**The Explicit Suppression Rule.** State data ditahan memakai warna netral sekaligus teks yang jelas; warna saja tidak pernah cukup.

## Typography

**Display Font:** Inter dengan fallback ui-sans-serif dan system-ui
**Body Font:** Inter dengan fallback ui-sans-serif dan system-ui
**Label/Mono Font:** ui-monospace untuk nomor peringkat; sans-serif utama untuk label lain

**Character:** Satu keluarga sans-serif menjaga dashboard ringkas dan lugas. Kontras muncul melalui ukuran, bobot, tracking, case, dan penggunaan mono yang sangat terbatas; tidak ada pasangan display dekoratif pada baseline incumbent.

### Hierarchy

- **Headline** (Inter/system sans, weight 800, 28px, line-height 1.2, letter-spacing -0.04em): Judul dialog dan state besar; tebal, rapat, dan pendek.
- **Title** (Inter/system sans, weight 700, 22px, line-height 1.25, letter-spacing -0.04em): Judul bagian serta modul data; menjadi anchor sebelum angka atau visualisasi.
- **Body** (Inter/system sans, weight 400, 13px, line-height 1.5): Label data, isi tabel, metadata penting, dan microcopy dengan ritme baca yang padat.
- **Label** (Inter/system sans, weight 800, 10px, letter-spacing 0.08em, uppercase): Eyebrow, header tabel, dan kategori; untuk orientasi, bukan paragraf.
- **Rank** (ui-monospace, weight 700, 10–11px): Mono hanya untuk ordinal dan nomor pendek agar kolom angka tetap stabil.

### Named Rules

**The Data Voice Rule.** Gunakan bobot dan tabular alignment untuk hierarki data; jangan memperkenalkan typeface dekoratif untuk membuat dashboard terasa penting.

**The Small Copy Rule.** Teks kecil selalu memiliki fungsi metadata dan tetap berkontras; jangan mengecilkan batasan atau disclosure agar menghilang.

## Layout

Varian B memakai satu kolom dashboard chart-first dengan lebar maksimum 1180px dan gutter horizontal 20px per sisi. Header merek/status membingkai halaman, sementara tab menjadi tulang punggung navigasi antar Standing, PW, PD, Profil, serta Alasan dan Harapan. Panel aktif berbagi tepi dengan tab sehingga navigasi dan isi terbaca sebagai satu alat.

Ritme utama menggunakan ruang 16–30px, dengan panel data umumnya memakai padding 28–30px. Ranking desktop tersusun sebagai empat kolom—ordinal, nama, track, dan nilai—lalu berubah menjadi susunan dua baris pada layar kecil. Grid profil turun dari tiga kolom ke dua lalu satu; tabel berubah menjadi kartu berlabel; peta mempertahankan skala analitisnya dengan horizontal scroll pada mobile.

Breakpoint incumbent berada pada 820px dan 560px. Adaptasi memprioritaskan pemindaian dan ukuran target kontrol, bukan sekadar mengecilkan desktop. Kontrol utama memiliki tinggi minimum 42–44px, sedangkan dialog dibatasi oleh viewport dan dapat discroll secara internal.

### Named Rules

**The One Active Lens Rule.** Tampilkan satu lensa data utama per tab; detail kandidat atau wilayah masuk ke dialog, bukan mengubah Standing global secara terselubung.

**The Preserve the Evidence Rule.** Pada mobile, ubah struktur tabel menjadi blok berlabel atau berikan scroll yang jujur; jangan menghapus kolom atau konteks tanpa penanda.

## Elevation & Depth

Sistem memakai kedalaman berlapis editorial. Border dan perbedaan tonal membangun struktur dasar; shadow ambient rendah (`0 12px 40px rgb(39 48 40 / 7%)`) menyatukan panel aktif dengan tab, tooltip memakai shadow lebih terarah (`0 14px 35px rgb(20 30 25 / 25%)`), dan dialog menjadi lapisan tertinggi (`0 24px 80px rgb(5 15 11 / 38%)`) di atas backdrop gelap yang diburamkan ringan.

### Shadow Vocabulary

- **Panel Ambient** (`0 12px 40px rgb(39 48 40 / 7%)`): Bayangan rendah untuk panel aktif, tabel, dan surface data yang menempel pada tab.
- **Floating Context** (`0 14px 35px rgb(20 30 25 / 25%)`): Bayangan sedang untuk tooltip dan toast yang mengambang dekat sumbernya.
- **Modal Focus** (`0 24px 80px rgb(5 15 11 / 38%)`): Bayangan kuat hanya untuk dialog yang menghentikan interaksi dengan halaman.

### Named Rules

**The Structural First Rule.** Bangun kedalaman dengan border, tonal layering, dan posisi terlebih dahulu; tambahkan shadow hanya ketika sebuah lapisan benar-benar berada di atas yang lain.

## Shapes

Bahasa bentuk bergerak dari tepi editorial yang hampir persegi ke overlay yang lebih lembut. Panel utama yang terhubung dengan tab memakai radius kecil, kontrol memakai lengkung 7–8px, kartu/status memakai 10–12px, dan dialog memakai 16px. Chip, track chart, titik status, serta tombol tutup berbentuk pil atau lingkaran penuh. Border tipis memisahkan informasi; garis putus-putus hanya menandai ambang atau perubahan kategori.

**The Nested Radius Rule.** Radius meningkat mengikuti tingkat kedekatan dan elevasi: panel data paling tegas, kontrol lebih ramah, overlay paling lembut.

## Components

Komponen terasa terkendali dan informatif: state terbaca cepat, target cukup besar, dan ornamen tunduk pada data.

### Buttons

- **Shape:** Kontrol persegi lembut dengan radius 7–8px; tombol tutup dialog berbentuk lingkaran.
- **Primary:** Baseline belum memiliki tombol aksi primer bermerek; jangan mengarang satu dari warna chart.
- **Secondary:** Transparan atau memakai soft fill, teks Tinta Gelap atau Teal Musyawarah, dengan padding ringkas dan tinggi sentuh minimal 42px.
- **Hover / Focus:** Hover mengubah surface atau warna teks secara tenang. Focus-visible memakai outline teal 3px dengan offset 3px dan tidak boleh dihapus.

### Chips

- **Style:** Pil netral untuk cohort pasif; fill teal sangat pucat dan teks teal untuk filter aktif.
- **State:** Label selalu menyebut nilai filter; warna hanya memperkuat state.

### Cards / Containers

- **Corner Style:** Panel terhubung memakai radius kecil; kartu mandiri 10–12px; overlay 16px.
- **Background:** Surface putih di atas Kertas Hangat, dengan soft fill untuk subkelompok atau state kosong.
- **Shadow Strategy:** Border dan tonal layering menjadi default; shadow mengikuti kosakata elevasi.
- **Border:** Garis tipis untuk panel, baris, dan kartu; border putus-putus hanya untuk state unavailable.
- **Internal Padding:** 18px untuk kartu rapat, 28–30px untuk panel utama.

### Inputs / Fields

- **Style:** Surface putih, border Line, radius kontrol, dan tinggi minimum 44px.
- **Focus:** Outline teal 3px dengan offset yang jelas.
- **Error / Disabled:** Baseline memiliki unavailable dan disabled-tab states, tetapi belum menetapkan field-error visual; jangan menyimpulkannya dari warna peringatan.

### Navigation

Tab berada dalam rail tonal yang menyatu dengan panel. State aktif berubah menjadi Surface putih dengan Tinta Gelap dan shadow sangat ringan; state pasif tetap muted. Pada mobile tab dapat discroll horizontal dan tidak dipaksa menyusut hingga label terpotong.

### Status

Status menggabungkan titik berhalo, judul, dan catatan waktu/kondisi. Warna berubah menurut live, menunggu, atau final, tetapi teks selalu menyatakan status lengkap. Versi compact mempertahankan bentuk dan hierarchy sambil mengurangi detail pada mobile.

### Ranked Data Row

Baris ranking mengunci ordinal, nama, track, dan nilai dalam grid stabil. Nama Kandidat adalah tombol teks dengan underline dotted; bar memakai Spektrum Pembeda; persentase dan jumlah tetap terbaca sebagai teks. `Nama Lain` dan `Belum Menentukan` dipisahkan dari daftar kandidat tanpa menyamarkannya.

### Dialog and Tooltip

Dialog memakai backdrop gelap, fokus visual kuat, tombol tutup eksplisit, dan internal scroll. Tooltip memakai surface gelap dengan daftar Top 3 yang padat serta terbuka melalui hover maupun fokus. Keduanya harus tetap dapat digunakan dengan keyboard.

## Do's and Don'ts

### Do:

- **Do** letakkan data, status, dan batas interpretasi dalam hierarchy yang dapat dipindai tanpa bergantung pada warna.
- **Do** gunakan Kertas Hangat sebagai kanvas dan Surface putih sebagai lapisan kerja utama.
- **Do** pertahankan tinggi kontrol minimal 42–44px dan focus-visible outline 3px.
- **Do** gunakan Spektrum Pembeda hanya untuk membedakan kandidat atau seri data dengan bobot yang setara.
- **Do** pertahankan perilaku adaptif: ranking reflow, tabel menjadi blok berlabel, dan tab/peta boleh scroll bila konteks perlu dipertahankan.

### Don't:

- **Don't** membuat antarmuka terasa seperti papan skor malam pemilu atau mengubah ranking menjadi deklarasi pemenang.
- **Don't** mengadopsi kilau, gradien, kartu metrik, atau bahasa pertumbuhan ala dashboard fintech.
- **Don't** meniru formalitas dan ornamentasi portal resmi pemerintah; Project Mandala tetap independen dan editorial.
- **Don't** memakai warna kandidat sebagai aksen merek, status sukses, atau CTA.
- **Don't** menyembunyikan suppression, keterbatasan, atau microcopy penting melalui kontras rendah, ukuran ekstrem kecil, atau hover-only disclosure.
- **Don't** memasukkan kontrol prototipe Varian A/B/C ke dalam komponen produksi atau design system.
