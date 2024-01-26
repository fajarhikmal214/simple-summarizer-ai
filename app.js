import { fileURLToPath } from 'url';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import xss from 'xss-clean';
import compression from 'compression';
import cors from 'cors';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const openai = new OpenAI({ apiKey: process.env.API_KEY }); 

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/generate', async (req, res) => {
    const content = req.body.data;
    
    // Add custom knowledge base logic and combine with user content
    const customKnowledge = `
        Hei. Saya punya beberapa kegiatan yang dilakukan selama 1 bulan penuh dalam pekerjaan dan ada perintah untuk membuat kesimpulan dari kegiatan yang dilakukan selama dalam periode bulan tersebut. \n
        Ada beberapa poin seperti 1. Output; 2.Kendala; dan 3. Solusi dan kategorikan berdasarkan setiap pointnya. Berikan setidaknya 3 paragraf untuk setiap poinnya menggunakan list. \n \n
        
        MENGGUNAKAN BAHASA BAHU ADALAH WAJIB \n \n

        Dan berikan perspektif satu orang (yang membuat laporan) bukan sebagai tim. \n \n
        
        Uraikan deskripsi dengan jelas dan jika ada contoh-contoh kegiatan yang tidak jelas dan tidak deskriptif seperti feat(...), fix(...) atau commit message secara langsung maka hindari itu dan ubah kegiatan-kegiatan teknis menjadi deskripsi non-teknis. \n
        
        Dan ubahlah nama kegiatan yang kaku (seperti contoh langsung) menjadi naratif yang baik tanpa menggunakan simbol seperti buka kurung. \n

        Berikan response dalam bentuk paragraf HTML yang rapi tanpa tabel agar mudah ditampilkan ke user sebagai HTML. \n \n 

        Saya punya contohnya \n \n

        Output : \n
        - Peningkatan dan Perbaikan Sistem: Kegiatan mencakup perbaikan fitur penting sistem, penambahan fungsionalitas baru, dan penyesuaian fitur yang ada untuk memperbaiki pengalaman pengguna. Misalnya, ada kegiatan untuk meningkatkan jadwal sistem agar berjalan lebih efisien dan memodifikasi atribut dokumen untuk memenuhi kebutuhan pengguna. \n
        - Kolaborasi Tim dan Perencanaan: Meliputi diskusi tim untuk menyusun strategi kolaborasi, merencanakan pengujian otomatisasi, dan berbagi pengetahuan tentang solusi teknis. Ada juga pertemuan reguler untuk koordinasi proyek dan sprint planning. \n
        - Penelitian dan Pengembangan: Termasuk kegiatan eksplorasi fitur baru pada platform dan alat pengembangan, serta penelitian untuk meningkatkan kinerja dan stabilitas sistem. \n

        Kendala : \n
        - Tantangan Teknis: Menghadapi masalah seperti analisis data yang tidak konsisten dan perlu mencari solusi untuk masalah teknis yang kompleks. \n
        - Koordinasi dalam Tim: Mengelola komunikasi efektif dan pembagian tugas di antara anggota tim, termasuk mengatur prioritas dan menangani umpan balik. \n

        Solusi : \n
        - Pembaruan dan Perbaikan Berkala: Termasuk kegiatan untuk meningkatkan proses pemeriksaan kode tim, serta pembaruan dan perbaikan berkala untuk memastikan kualitas dan performa sistem yang tinggi. \n
        - Pengelolaan Tugas Tim: Menggunakan sesi perencanaan dan grooming untuk memastikan tugas dibagi secara adil dan efisien, serta mengadakan diskusi reguler untuk memastikan semua anggota tim selaras. \n
        - Adaptasi dengan Teknologi Baru: Implementasi metode baru dan teknologi untuk memperkuat sistem, seperti menambahkan panduan dinamis di pusat bantuan atau mengoptimalkan penggunaan cache untuk pengumuman. \n \n

        Anda dapat mengikuti format seperti itu. \n

        Ini data laporannya \n \n

        ${content} \n \n
    `;

    try {
      const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: customKnowledge }],
        model: 'gpt-4',
      });

      const reply = response.choices[0].message.content
      const formattedReply = reply.replace(/\n/g, '<br>');

      res.json({ reply: formattedReply });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
