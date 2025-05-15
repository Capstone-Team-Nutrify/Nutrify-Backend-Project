import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'username harus diisi'],
        minlength: [3, 'username min 3 karakter']
    },
    email: {
        type: String,
        required: [true, 'email harus diisi'],
        validate: {
            validator: validator.isEmail,
            message: 'Inputan harus berupa email'
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password harus diisi'],
        minlength: [6, 'password min 6 karakter']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    EmailVerifiedAt: {
        type: Date,
    }
});

userSchema.pre("save", async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (reqBody) {
    return await bcrypt.compare(reqBody, this.password);
}

const User = mongoose.model('User', userSchema);

export default User;