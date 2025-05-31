import mongoose from 'mongoose';
const { Schema } = mongoose;

const BahanSchema = new Schema({
    nama: String,
    jumlah: String,
    alias: String
}, { _id: false });

const VitaminSchema = new Schema({
    vitamin_A: Number, vitamin_B1: Number, vitamin_B2: Number,
    vitamin_B3: Number, vitamin_B5: Number, vitamin_B6: Number,
    vitamin_B9: Number, vitamin_B12: Number, vitamin_C: Number,
    vitamin_D: Number, vitamin_E: Number, vitamin_K: Number
}, { _id: false });

const MineralSchema = new Schema({
    kalsium: Number, zat_besi: Number, magnesium: Number,
    fosfor: Number, kalium: Number, zinc: Number
}, { _id: false });

const NutrisiSchema = new Schema({
    kalori: Number,
    lemak: Number,
    karbohidrat: Number,
    gula: Number,
    protein: Number,
    serat: Number,
    kolesterol: Number,
    natrium: Number,
    air: Number,
    vitamin: VitaminSchema, 
    mineral: MineralSchema  
}, { _id: false, strict: false });

const DiseaseRateSchema = new Schema({
    penyakit: String,
    peringatan: String,
    catatan: String
}, { _id: false });

const FoodItemSchema = new Schema({
    nama: {
        type: String,
        required: true,
        trim: true,

    },
    asal: {
        type: String,
        trim: true
    },
    kategori: {
        type: String,
        required: true,
    },
    deskripsi: {
        type: String,
        trim: true
    },
    foto_url: {
        type: String,
        trim: true
    },
    bahan: [BahanSchema],
    nutrisi_per_100g: NutrisiSchema,
    disease_rate: [DiseaseRateSchema], 
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    collection: 'makanan dan minuman'
});

FoodItemSchema.index({ nama: 'text', asal: 'text', kategori: 'text' });

const FoodItem = mongoose.model('FoodItem', FoodItemSchema);

export default FoodItem;