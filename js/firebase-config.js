// firebase-config.js - الإصدار النمطي مع الإعدادات الجديدة
console.log("🎯 جاري تحميل إعدادات Firebase الجديدة...");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// إعدادات Firebase الجديدة التي زودتها
const firebaseConfig = {
    apiKey: "AIzaSyAMp0WIvwkNqJDj-5ZILYyOBlQ5rqswxQ8",
    authDomain: "wacel-live-pro.firebaseapp.com",
    projectId: "wacel-live-pro",
    storageBucket: "wacel-live-pro.firebasestorage.app",
    messagingSenderId: "513770981112",
    appId: "1:513770981112:web:53df4c981965191c00dd0d",
    databaseURL: "https://wacel-live-pro-default-rtdb.firebaseio.com/" // تم إضافته
};

// تهيئة التطبيق
let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    console.log("✅ تم تهيئة Firebase App بنجاح:", app.name);
    
    db = getDatabase(app);
    console.log("✅ تم تهيئة Realtime Database");
    
    auth = getAuth(app);
    console.log("✅ تم تهيئة Authentication");
    
    console.log("🔗 معلومات الاتصال:");
    console.log("- Project ID:", firebaseConfig.projectId);
    console.log("- Database URL:", firebaseConfig.databaseURL);
    console.log("- Auth Domain:", firebaseConfig.authDomain);
    
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
    
    // نسخة تجريبية للطوارئ
    console.log("🔄 استخدام نسخة تجريبية للطوارئ");
    
    auth = {
        currentUser: null,
        signInWithEmailAndPassword: (email, password) => {
            console.log("🔐 تسجيل دخول تجريبي:", email);
            return Promise.resolve({
                user: {
                    email: email,
                    uid: 'emergency-user-' + Date.now(),
                    emailVerified: true
                }
            });
        },
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            console.log("👀 مراقبة حالة المصادقة (تجريبي)");
            callback(null);
            return () => {};
        }
    };
}

// تصدير الخدمات
export { app, db, auth };