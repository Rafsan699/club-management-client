import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    // এখানে clubUser অবজেক্ট থেকে টোকেন নেওয়া হচ্ছে (অথवा সরাসরি token থাকলে সেটি নিবে)
    const storedUser = localStorage.getItem('clubUser');
    let token = localStorage.getItem('token');
    
    if (!token && storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            token = parsedUser.token; // যদি ব্যাকএন্ড থেকে টোকেন পাঠানো হয়
        } catch (e) {
            console.error(e);
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;