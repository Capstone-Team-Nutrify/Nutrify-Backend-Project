import express from 'express'
import authRoutes from './routes/authRoutes.js'
import 'dotenv/config'
import mongoose from 'mongoose'

const app = express()
const port = 8080

app.use('/api/auth', authRoutes);

//Koneksi DB
try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Berhasil terhubung ke MongoDB')
} catch (error) {
    console.log('Gagal terhubung ke MongoDB',error);
}

app.listen(port, () => {
    console.log(`Berjalan diport ${port}`)
})