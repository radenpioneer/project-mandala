# Project Mandala

Project Mandala adalah inisiatif independen yang tidak didukung PP KAMMI untuk menghimpun dan menyajikan preferensi komunitas KAMMI menjelang Muktamar XIV KAMMI. Hasilnya anonim, non-binding, dan berada di luar mekanisme resmi organisasi.

## Language

**Survei Preferensi**:
Polling anonim untuk membaca preferensi terhadap calon Ketua Umum PP KAMMI dan konteks dasar partisipannya. Survei ini bukan pemilihan resmi dan tidak menetapkan pemenang.
_Avoid_: Pemilu, voting resmi, mekanisme organisasi

**Partisipan**:
Orang yang memperoleh akses survei dan diasumsikan merupakan kader aktif KAMMI. Project Mandala tidak memeriksa asumsi atau memverifikasi status tersebut; karena itu partisipan bukan kader terverifikasi.
_Avoid_: Pemilih, kader terverifikasi

**Profil Partisipan**:
Sekumpulan data dasar yang dinyatakan sendiri oleh partisipan untuk mengelompokkan hasil tanpa mengungkap identitas individu. Dimensinya mencakup PW KAMMI dan PD KAMMI tempat partisipan menyatakan dirinya terdaftar, jenjang keanggotaan, dan level kepengurusan, serta dapat bertambah sebelum survei dibekukan. Keterdaftaran tersebut tidak diverifikasi oleh Project Mandala.
_Avoid_: Identitas kader, data keanggotaan terverifikasi

**Daftar Substruktur**:
Daftar tertutup PW KAMMI dan PD KAMMI beserta relasinya yang disediakan dan dipelihara oleh Project Maintainer. Profil Partisipan hanya menerima PW dan PD dari daftar ini; unit di luar daftar tidak dapat dimasukkan lewat teks bebas.
_Avoid_: Daftar wilayah administratif, registry resmi PP KAMMI

**Jenjang Keanggotaan**:
Jenjang Anggota Biasa yang sedang disandang dan dinyatakan sendiri oleh partisipan: AB I, AB II, atau AB III. Jenjang bergerak naik dari AB I hingga AB III dan tidak diverifikasi oleh Project Mandala.
_Avoid_: Jenjang tertinggi yang pernah dicapai, status kader terverifikasi

**Status Kepengurusan**:
Kedudukan kepengurusan yang sedang dijalankan dan dinyatakan sendiri oleh partisipan. Status ini membedakan non-pengurus dari pengurus pada tingkat PP, PW, PD, PLN, atau PK, lalu mengelompokkan perannya sebagai Pimpinan (Ketua, Sekretaris, atau Bendahara), Ketua/Sekretaris Bidang, atau Staf Pengurus. Partisipan yang merangkap jabatan memilih sendiri satu jabatan aktif untuk dicatat.
_Avoid_: Riwayat kepengurusan, jabatan terverifikasi

**Kandidat**:
Calon Ketua Umum PP KAMMI yang tersedia sebagai pilihan dalam Survei Preferensi. Daftar awal dimasukkan sebelum survei dibuka; nama baru dapat ditambahkan setelah melalui moderasi Respons.
_Avoid_: Pemenang

**Nama Lain**:
Nama yang ditulis sendiri oleh partisipan ketika pilihannya tidak tersedia dalam daftar Kandidat. Nama tersebut tersimpan sebagai Respons, lalu dapat menjadi pilihan bagi partisipan berikutnya setelah moderasi.
_Avoid_: Kandidat terverifikasi

**Belum Menentukan**:
Pilihan Respons bagi partisipan yang telah menyelesaikan Survei Preferensi tetapi belum memilih Kandidat atau Nama Lain. Pilihan ini dihitung sebagai partisipasi, tetapi dipisahkan dari distribusi preferensi Kandidat.
_Avoid_: Abstain resmi, suara tidak sah

**Alasan dan Harapan**:
Jawaban bebas opsional yang menjelaskan alasan di balik pilihan partisipan dan harapannya untuk Muktamar XIV KAMMI. Teks mentah tidak ditampilkan publik; penggunaan untuk tema agregat tunduk pada moderasi, disclosure-control, dan kebijakan AI.
_Avoid_: Testimoni publik, kutipan berizin, identitas partisipan

**Tautan Masuk**:
Satu tautan bersama yang membuka percakapan dengan nomor WhatsApp Project Mandala. Tautan ini membatasi jalur penyebaran, tetapi tidak membuktikan status partisipan.
_Avoid_: Tautan verifikasi, undangan pribadi

**Standing**:
Ringkasan berjalan atas jumlah partisipasi dan hasil Survei Preferensi selama survei masih dibuka. Standing bukan hasil pemilihan resmi.
_Avoid_: Hasil pemilu, pemenang resmi

**Respons**:
Pilihan final dan Alasan dan Harapan opsional milik satu partisipan, unik per nomor WhatsApp namun tidak dianggap sebagai bukti satu kader unik. Respons dapat diperbarui sampai Survei Preferensi ditutup.
_Avoid_: Suara sah, suara kader terverifikasi

**Draft Respons**:
Data sementara dari perjalanan survei yang belum disubmit. Draft Respons dihapus tujuh hari setelah aktivitas terakhir atau ketika Survei Preferensi ditutup, mana yang lebih dahulu.
_Avoid_: Respons, jawaban final

**Catatan Persetujuan**:
Rekaman versi kebijakan dan waktu ketika Partisipan memilih `Setuju dan lanjut`, yang dapat dikaitkan ke nomor WhatsApp sampai 30 hari setelah Survei Preferensi ditutup. Setelah Gerbang Anonimisasi, hanya kebijakan historis dan statistik persetujuan tanpa identifier yang dipertahankan.
_Avoid_: Persetujuan tersirat, log percakapan lengkap

**Anonimitas Operasional**:
Pemisahan penyimpanan nomor WhatsApp dari isi Respons setelah kuesioner diselesaikan. Nomor tetap disimpan untuk status partisipasi, pengiriman update, dan pemberian Akses Edit; sistem masih dapat menghubungkan nomor dengan Respons untuk keperluan tersebut. Konsep ini bukan anonimitas absolut dan tidak digunakan sebagai klaim kepada Partisipan.
_Avoid_: Anonimitas absolut

**Gerbang Anonimisasi**:
Pemeriksaan paling lambat 30 hari setelah Survei Preferensi ditutup untuk menentukan apakah Respons dapat dipertahankan tanpa batas setelah pengait dan rincian yang memungkinkan identifikasi dihapus atau digeneralisasi. Respons yang gagal melewati pemeriksaan dihapus; hanya agregat yang aman dipertahankan.
_Avoid_: Penghapusan nomor saja, anonimisasi otomatis

**Uji Coba Terbatas**:
Pengujian perjalanan dan operasi Survei Preferensi sebelum peluncuran live. Respons Uji Coba Terbatas tidak menjadi hasil live dan dihapus setelah evaluasi sebelum peluncuran.
_Avoid_: Gelombang awal survei live, data live

**Project Maintainer**:
Operator teknis tunggal yang menjalankan Survei Preferensi tanpa kewenangan mengubah isi Respons atau menilai keabsahan status kader partisipan.
_Avoid_: Komite survei, validator kader

**Akses Edit**:
Kemampuan nomor WhatsApp yang sama untuk meminta dan menyimpan perubahan Respons sampai Survei Preferensi ditutup. Partisipan memulai perubahan dengan mengetik “ubah jawaban”; tidak ada token yang ditampilkan atau perlu dimasukkan.
_Avoid_: Token publik, pemulihan dari nomor lain

**Langganan Update**:
Status penerimaan update mingguan Project Mandala melalui WhatsApp. Persetujuan awal menyebut langganan ini secara eksplisit; setiap Partisipan otomatis terdaftar setelah submit dan dapat berhenti melalui pengaturan jawaban atau tindakan berhenti yang disertakan pada setiap update.
_Avoid_: Langganan tanpa disclosure, pesan wajib tanpa opt-out

**Kontak Privasi**:
Kanal publik di luar nomor WhatsApp peserta untuk keluhan privasi serta permintaan koreksi atau penghapusan dari orang yang diajukan sebagai Nama Lain. Akses, koreksi, atau penghapusan data Partisipan tetap diautentikasi melalui nomor WhatsApp yang sama selama pengaitnya tersedia.
_Avoid_: Kanal Akses Edit, kontak pribadi Project Maintainer

**Steering Committee Muktamar**:
Panitia resmi PP KAMMI yang mengatur Muktamar XIV KAMMI serta menentukan tanggal dan waktu pelaksanaannya. Steering Committee Muktamar tidak memiliki hubungan dengan Project Mandala.
_Avoid_: Komite Project Mandala, pendukung Project Mandala
