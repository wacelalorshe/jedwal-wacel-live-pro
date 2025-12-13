// secure-firebase-config.js - إعدادات Firebase مع حماية متقدمة
console.log("🔐 تحميل إعدادات Firebase المؤمنة...");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

class SecureFirebase {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyAMp0WIvwkNqJDj-5ZILYyOBlQ5rqswxQ8",
            authDomain: "wacel-live-pro.firebaseapp.com",
            databaseURL: "https://wacel-live-pro-default-rtdb.firebaseio.com/",
            projectId: "wacel-live-pro",
            storageBucket: "wacel-live-pro.firebasestorage.app",
            messagingSenderId: "513770981112",
            appId: "1:513770981112:web:53df4c981965191c00dd0d"
        };
        
        this.app = null;
        this.db = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // التحقق من صحة النطاق أولاً
        if (!window.firebaseProtection?.isValidDomain) {
            console.error("🚫 محاولة تهيئة Firebase من نطاق غير مصرح");
            return;
        }
        
        try {
            this.app = initializeApp(this.firebaseConfig, 'secure-app-' + Date.now());
            this.db = getDatabase(this.app);
            this.isInitialized = true;
            
            console.log("✅ Firebase مؤمن مهيئ بنجاح");
            console.log("🔗 Project ID:", this.firebaseConfig.projectId);
            
            // حماية إضافية للقاعدة البيانات
            this.protectDatabase();
            
        } catch (error) {
            console.error("❌ خطأ في تهيئة Firebase المؤمن:", error);
            this.handleFirebaseError(error);
        }
    }
    
    protectDatabase() {
        // إضافة مراقبة لطلبات قاعدة البيانات
        const originalRef = this.db.ref;
        
        this.db.ref = function(path) {
            const ref = originalRef.call(this, path);
            
            // حماية مسارات معينة
            const protectedPaths = ['users', 'admin', 'settings', 'logs'];
            if (protectedPaths.some(p => path.includes(p))) {
                console.warn("⚠️ محاولة وصول إلى مسار محمي:", path);
                throw new Error('Access Denied: Protected Path');
            }
            
            return ref;
        };
        
        console.log("✅ حماية قاعدة البيانات مفعلة");
    }
    
    handleFirebaseError(error) {
        // التعامل مع أخطاء Firebase بشكل آمن
        const errorMessage = error.message || 'Unknown Firebase Error';
        
        if (errorMessage.includes('permission_denied')) {
            console.error("🚫 صلاحية مرفوضة - تحقق من قواعد الأمان");
        } else if (errorMessage.includes('network')) {
            console.error("🌐 خطأ في الشبكة - تحقق من اتصال الإنترنت");
        }
        
        // عدم عرض رسائل الخطأ الحساسة للمستخدم
        window.firebaseProtection?.logSuspiciousActivity(`Firebase Error: ${errorMessage}`);
    }
    
    // طرق آمنة للوصول إلى البيانات
    async getMatches() {
        if (!this.isInitialized || !this.db) {
            throw new Error('Firebase not initialized');
        }
        
        const { ref, get } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        
        try {
            const matchesRef = ref(this.db, 'matches');
            const snapshot = await get(matchesRef);
            
            if (!snapshot.exists()) {
                return [];
            }
            
            const data = snapshot.val();
            
            // إضافة علامة مائية للبيانات
            const watermarkedData = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...window.firebaseProtection?.addDataWatermark?.(value) || value
            }));
            
            return watermarkedData;
            
        } catch (error) {
            this.handleFirebaseError(error);
            throw error;
        }
    }
    
    async addMatch(matchData) {
        if (!this.isInitialized || !this.db) {
            throw new Error('Firebase not initialized');
        }
        
        const { ref, push } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        
        try {
            // تشفير الروابط قبل الحفظ
            const securedData = {
                ...matchData,
                links: matchData.links?.map(link => window.encryptLink?.(link) || link),
                xmtvLink: matchData.xmtvLink ? window.encryptLink?.(matchData.xmtvLink) : null,
                addedFrom: window.location.hostname,
                timestamp: Date.now()
            };
            
            const matchesRef = ref(this.db, 'matches');
            const result = await push(matchesRef, securedData);
            
            console.log("✅ مباراة مؤمنة مضافة بنجاح:", result.key);
            return result.key;
            
        } catch (error) {
            this.handleFirebaseError(error);
            throw error;
        }
    }
}

// إنشاء نسخة مؤمنة من Firebase
window.secureFirebase = new SecureFirebase();

// تصدير الخدمات المؤمنة
export const secureApp = window.secureFirebase.app;
export const secureDb = window.secureFirebase.db;
export const getSecureMatches = () => window.secureFirebase.getMatches();
export const addSecureMatch = (data) => window.secureFirebase.addMatch(data);
