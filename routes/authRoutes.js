import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
    res.send("Login Router");
});

router.post('/register', (req, res) => {
    res.send("Register Router");
});

router.post('/logout', (req, res) => {
    res.send("Logout Router");
});

router.get('/getuser', (req, res) => {
    res.send("Get User Router");
});

export default router;