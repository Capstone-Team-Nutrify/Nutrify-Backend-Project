import {
    registerUser,
    loginUser,
    logoutUser,
    currentUser,
} from "../controllers/authController.js";

export default [
    {
        method: "POST",
        path: "/api/auth/register",
        options: {
            auth: false
        },
        handler: registerUser,
    },
    {
        method: "POST",
        path: "/api/auth/login",
        options: {
            auth: false 
        },
        handler: loginUser,
    },
    {
        method: "POST",
        path: "/api/auth/logout",
        options: {
            auth: {
                strategy: "jwt",
                mode: "try", 
            },
        },
        handler: logoutUser,
    },
    {
        method: "GET",
        path: "/api/auth/me",
        options: {
            auth: {
                strategy: "jwt",
                mode: "required"
            }
        },
        handler: currentUser,
    },
];
