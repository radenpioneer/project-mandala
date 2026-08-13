# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pengguna utama adalah Partisipan Survei: orang yang memperoleh akses Survei Preferensi dan diasumsikan merupakan kader aktif KAMMI. Mereka ingin menyatakan preferensi terhadap calon Ketua Umum PP KAMMI beserta Profil Partisipan serta Alasan dan Harapan opsional, dengan persetujuan yang jelas dan kemampuan memperbarui Respons sampai survei ditutup.

Pembaca hasil menggunakan Standing dan Hasil Akhir Survei Preferensi untuk memahami kecenderungan di antara partisipan tanpa menganggapnya sebagai hasil pemilihan resmi. Project Maintainer adalah operator teknis tunggal yang menjalankan survei, moderasi, Kontrol Pengungkapan, dan finalisasi.

## Product Purpose

Project Mandala menghimpun preferensi komunitas KAMMI menjelang Muktamar XIV KAMMI melalui perjalanan berbasis WhatsApp, lalu menerbitkan hanya agregat terkendali. Produk ini membantu komunitas membaca preferensi dan konteks dasar partisipan tanpa menjadikannya mekanisme pemilihan atau klaim keterwakilan resmi.

Keberhasilan berarti:

- Partisipan dapat memahami persetujuan, menyelesaikan Survei Preferensi, dan memperbarui Respons melalui nomor WhatsApp yang sama sampai survei ditutup.
- Standing dan Hasil Akhir Survei Preferensi dapat diterbitkan tepat waktu tanpa mengungkap Respons individual atau teks mentah Alasan dan Harapan.
- Pembaca memahami bahwa partisipasi bersifat self-selected, status kader tidak diverifikasi, dan hasil bersifat independen, tidak resmi, serta non-binding.
- Satu Project Maintainer dapat menjalankan moderasi, koreksi privasi, dan finalisasi secara konsisten tanpa mengubah isi Respons partisipan.

## Positioning

Project Mandala bukan polling terbuka biasa atau mekanisme resmi KAMMI. Mekanismenya memadukan satu jalur masuk berbasis WhatsApp, Respons yang dapat diperbarui, pemisahan data kontak dari isi Respons secara operasional, moderasi Nama Lain yang tidak mengubah pilihan asli, serta Kontrol Pengungkapan sebelum agregat dipublikasikan.

## Operating Context

- Partisipan masuk melalui satu tautan bersama yang membuka percakapan dengan nomor WhatsApp Project Mandala. Tautan dan nomor tersebut tidak memverifikasi status kader atau membuktikan satu kader unik.
- Profil Partisipan dinyatakan sendiri dan mencakup PW KAMMI, PD KAMMI, Jenjang Keanggotaan, dan Status Kepengurusan dari pilihan tertutup yang dipelihara Project Maintainer.
- Respons mencakup Kandidat, Nama Lain, atau Belum Menentukan, serta Alasan dan Harapan opsional. Partisipan dapat meminta Akses Edit dengan mengetik “ubah jawaban” dari nomor yang sama sebelum survei ditutup.
- Selama survei berlangsung, dashboard publik dapat menampilkan Standing yang selalu tunduk pada Kontrol Pengungkapan. Setelah penutupan, hasil melewati Finalisasi Hasil sebelum diterbitkan sebagai Hasil Akhir Survei Preferensi.
- Tema Alasan dan Harapan hanya disajikan sebagai kategori agregat setelah penutupan, tanpa kutipan atau teks mentah, dan selalu ditinjau Project Maintainer.

## Capabilities and Constraints

- Project Mandala independen, tidak didukung PP KAMMI, tidak terkait dengan Steering Committee Muktamar, dan hasilnya non-binding.
- Partisipasi bersifat self-selected. Status kader, Profil Partisipan, kelayakan Kandidat, dan keterdaftaran organisasi tidak diverifikasi.
- Satu nomor WhatsApp bukan bukti satu kader unik. Nomor dipakai untuk status partisipasi, Akses Edit, dan Langganan Update, tetapi harus disimpan terpisah dari isi Respons setelah kuesioner selesai.
- Nama Lain dapat diterima, dipetakan, disembunyikan, atau ditinjau kembali melalui Keputusan Moderasi. Pemetaan tidak boleh mengubah teks asli atau pilihan yang disubmit.
- Agregat publik harus melewati Kontrol Pengungkapan. Kelompok kecil dapat dibulatkan atau ditahan sepenuhnya; lolos kontrol tidak sama dengan validitas statistik.
- Teks mentah Alasan dan Harapan tidak boleh dipublikasikan. Tema agregat dapat dibantu AI hanya sesuai kebijakan AI dan tetap memerlukan tinjauan Project Maintainer.
- Draft Respons dihapus tujuh hari setelah aktivitas terakhir atau saat survei ditutup, mana yang lebih dahulu. Gerbang Anonimisasi dilakukan paling lambat 30 hari setelah penutupan; Respons yang tidak dapat dipertahankan dengan aman dihapus.
- Implementasi saat ini adalah prototipe web React/TypeScript dengan data sintetis, bukan sistem produksi. Backend Worker baru menyediakan endpoint contoh.
- Tanggal survei produksi, daftar Kandidat produksi, daftar PW/PD yang telah divalidasi, nilai threshold final, kanal Kontak Privasi, dan kebijakan AI masih perlu dipastikan sebelum peluncuran.

## Brand Commitments

- Nama produk: Project Mandala.
- Gunakan terminologi domain yang ditetapkan di `CONTEXT.md`, termasuk Partisipan, Respons, Survei Preferensi, Standing, dan Hasil Akhir Survei Preferensi. Hindari bahasa yang menyiratkan pemilu, pemilih, suara sah, kader terverifikasi, pemenang, atau hasil resmi.
- Suara produk harus lugas, transparan mengenai keterbatasan, berhati-hati terhadap klaim privasi dan keterwakilan, serta tidak melebih-lebihkan validitas data.

## Evidence on Hand

- `CONTEXT.md` memuat bahasa domain, batas kewenangan Project Maintainer, lifecycle privasi, dan aturan perilaku produk yang telah dirumuskan.
- `src/react-app/App.tsx` dan `src/react-app/App.css` memuat prototipe dashboard dengan data sintetis, state Standing hingga hasil akhir, filter Profil Partisipan, suppression state, tampilan PW/PD, dan Tema Alasan dan Harapan.
- `docs/research/kammi-organizational-profile-taxonomy.md` memuat riset struktur PW/PD dan menunjukkan bahwa belum ada registry publik mutakhir yang cukup otoritatif; daftar produksi memerlukan validasi organisasi atau sumber provisional yang diberi versi.
- Handoff prototipe menetapkan Varian B (`Cerita data`) sebagai baseline yang telah divalidasi, tetapi bukan implementasi produksi dan dapat direvisi secara eksplisit pada sesi re-prototyping.
- Tidak ada data survei produksi, testimoni, klaim keterwakilan, atau bukti dukungan resmi yang boleh dibuat-buat.

## Product Principles

1. Utamakan agensi dan pemahaman Partisipan: persetujuan, pilihan, edit, dan berhenti menerima update harus jelas.
2. Publikasikan sinyal yang berguna hanya ketika aman; perlindungan Respons individual mengalahkan kelengkapan atau presisi tampilan.
3. Nyatakan batas interpretasi di dekat hasil: independen, self-selected, tidak terverifikasi, tidak resmi, dan non-binding.
4. Pertahankan isi Respons; moderasi hanya mengatur pengelompokan dan keterlihatan dengan keputusan yang dapat ditinjau kembali.
5. Rancang agar dapat dioperasikan secara konsisten oleh satu Project Maintainer tanpa mengandalkan klaim atau proses yang tidak dapat dibuktikan.

## Accessibility & Inclusion

Pengalaman web harus adaptif untuk desktop dan mobile serta dapat digunakan dengan keyboard. Dialog, tooltip, filter, tabel, peta, status, dan visualisasi data harus memiliki nama dan alternatif yang dapat dipahami teknologi bantu. Informasi penting, status, dan perbedaan hasil tidak boleh disampaikan melalui warna saja.
