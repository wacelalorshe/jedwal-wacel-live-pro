// firebase-security.js - نظام حماية متقدم لقاعدة البيانات
console.log("🔒 تحميل نظام حماية Firebase...");

class FirebaseProtection {
    constructor() {
        this.allowedDomains = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost',
            '127.0.0.1',
            'wacel-live-pro.web.app',  // نطاق Firebase Hosting
            'wacel-live-pro.firebaseapp.com'
        ];
        
        this.encryptionKey = 'wacel_pro_2025_secret_key';
        this.isValidDomain = false;
        
        this.init();
    }
    
    init() {
        this.checkDomain();
        this.protectFirebaseData();
        this.preventDataTheft();
    }
    
    checkDomain() {
        const currentDomain = window.location.hostname;
        console.log("🌐 التحقق من المجال:", currentDomain);
        
        this.isValidDomain = this.allowedDomains.some(domain => 
            currentDomain.includes(domain) || domain.includes(currentDomain)
        );
        
        if (!this.isValidDomain) {
            console.warn("⚠️ الوصول من مجال غير مصرح:", currentDomain);
            this.blockUnauthorizedAccess();
        } else {
            console.log("✅ الوصول من مجال مصرح");
        }
        
        return this.isValidDomain;
    }
    
    protectFirebaseData() {
        // حماية طلبات Firebase
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const url = args[0];
            
            // منع الوصول المباشر إلى Firebase من نطاقات غير مصرحة
            if (url && url.includes('firebaseio.com') && !window.firebaseProtection?.isValidDomain) {
                console.error("🚫 محاولة وصول غير مصرحة إلى Firebase");
                return Promise.reject(new Error('Access Denied: Unauthorized Domain'));
            }
            
            return originalFetch.apply(this, args);
        };
        
        // حماية XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (url && url.includes('firebaseio.com') && !window.firebaseProtection?.isValidDomain) {
                console.error("🚫 محاولة وصول غير مصرحة عبر XHR");
                throw new Error('Access Denied: Unauthorized Domain');
            }
            return originalXHROpen.apply(this, [method, url, ...args]);
        };
    }
    
    preventDataTheft() {
        // منع فتح أدوات المطورين (اختياري)
        this.preventDevTools();
        
        // منع نسخ البيانات
        this.preventCopy();
        
        // تشفير البيانات الحساسة
        this.encryptSensitiveData();
        
        // إضافة علامة مائية للبيانات
        this.addWatermark();
    }
    
    preventDevTools() {
        // كشف فتح أدوات المطورين
        const devtools = /./;
        devtools.toString = function() {
            console.warn("⚠️ تم اكتشاف فتح أدوات المطورين");
            window.firebaseProtection?.logSuspiciousActivity('DevTools Opened');
            return '';
        };
        
        // كشف فتح Console
        setInterval(() => {
            const before = new Date();
            debugger;
            const after = new Date();
            if (after - before > 100) {
                console.warn("⚠️ تم اكتشاف فتح Debugger");
                window.firebaseProtection?.logSuspiciousActivity('Debugger Detected');
            }
        }, 1000);
    }
    
    preventCopy() {
        // منع نسخ النص
        document.addEventListener('copy', (e) => {
            if (window.firebaseProtection?.isFirebaseData(e.target)) {
                e.preventDefault();
                console.warn("🚫 محاولة نسخ بيانات Firebase");
                alert('⛔ غير مسموح بنسخ بيانات المباريات');
            }
        });
        
        // منع حفظ الصفحة
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u')) {
                e.preventDefault();
                console.warn("🚫 محاولة حفظ الصفحة");
            }
        });
        
        // منع النقر بزر الماوس الأيمن
        document.addEventListener('contextmenu', (e) => {
            if (window.firebaseProtection?.isFirebaseData(e.target)) {
                e.preventDefault();
                console.warn("🚫 محاولة فتح قائمة السياق");
            }
        });
    }
    
    encryptSensitiveData() {
        // تشفير الروابط الحساسة
        window.encryptLink = function(link) {
            if (!link) return '';
            
            try {
                // تشفير بسيط مع علامة مائية
                const timestamp = Date.now();
                const data = `${link}|${timestamp}|${window.location.hostname}`;
                return btoa(unescape(encodeURIComponent(data)));
            } catch (error) {
                console.error("❌ خطأ في التشفير:", error);
                return link;
            }
        };
        
        // فك التشفير
        window.decryptLink = function(encryptedLink) {
            if (!encryptedLink) return '';
            
            try {
                const decoded = decodeURIComponent(escape(atob(encryptedLink)));
                const parts = decoded.split('|');
                
                // التحقق من العلامة المائية
                if (parts.length === 3 && parts[2] === window.location.hostname) {
                    return parts[0];
                } else {
                    console.warn("⚠️ رابط مشفر غير صالح أو من نطاق آخر");
                    return '';
                }
            } catch (error) {
                console.error("❌ خطأ في فك التشفير:", error);
                return '';
            }
        };
    }
    
    addWatermark() {
        // إضافة علامة مائية مخفية للبيانات
        window.addDataWatermark = function(data) {
            if (!data || typeof data !== 'object') return data;
            
            const watermarkedData = {
                ...data,
                __watermark: {
                    domain: window.location.hostname,
                    timestamp: Date.now(),
                    project: 'wacel-live-pro',
                    signature: this.generateSignature(data)
                }
            };
            
            return watermarkedData;
        };
        
        // التحقق من العلامة المائية
        window.verifyWatermark = function(data) {
            if (!data || !data.__watermark) {
                console.warn("⚠️ بيانات بدون علامة مائية");
                return false;
            }
            
            const watermark = data.__watermark;
            const isValid = watermark.domain === window.location.hostname &&
                          watermark.project === 'wacel-live-pro' &&
                          watermark.signature === this.generateSignature(data);
            
            if (!isValid) {
                console.warn("🚫 بيانات مقلدة أو مسروقة");
                this.logSuspiciousActivity('Data Tampering Detected');
            }
            
            return isValid;
        };
    }
    
    generateSignature(data) {
        // توليد توقيع فريد للبيانات
        const str = JSON.stringify(data) + this.encryptionKey + window.location.hostname;
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(16);
    }
    
    isFirebaseData(element) {
        // التحقق إذا كان العنصر يحتوي على بيانات Firebase
        if (!element) return false;
        
        const text = element.textContent || element.value || '';
        const hasMatchData = /مانشستر|ليفربول|برشلونة|ريال|الهلال|النصر/.test(text);
        const hasLink = /https?:\/\//.test(text);
        
        return hasMatchData && hasLink;
    }
    
    logSuspiciousActivity(action) {
        // تسجيل النشاط المشبوه
        const logEntry = {
            action,
            domain: window.location.hostname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.warn("🚫 نشاط مشبوه:", logEntry);
        
        // يمكن إرسال السجل إلى سيرفرك
        this.sendSecurityLog(logEntry);
    }
    
    sendSecurityLog(logEntry) {
        // إرسال سجل الأمان إلى سيرفرك (اختياري)
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/security-log', JSON.stringify(logEntry));
            }
        } catch (error) {
            console.error("❌ خطأ في إرسال سجل الأمان:", error);
        }
    }
    
    blockUnauthorizedAccess() {
        // حظر الوصول الكامل
        document.body.innerHTML = this.getBlockMessage();
        
        // منع أي أكواد أخرى من التنفيذ
        window.stop();
        
        // حظر طلبات الشبكة
        window.fetch = null;
        XMLHttpRequest.prototype.open = function() {
            throw new Error('Access Denied');
        };
        
        throw new Error('🚫 Site Blocked: Unauthorized Domain');
    }
    
    getBlockMessage() {
        return `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 20px;
                z-index: 99999;
            ">
                <div style="max-width: 500px;">
                    <h1 style="color: #ff6b6b; font-size: 2.5rem; margin-bottom: 20px;">
                        ⛔ محتوى محمي
                    </h1>
                    <p style="font-size: 1.2rem; margin-bottom: 30px;">
                        هذا المحتوى محمي ولا يمكن الوصول إليه من هذا النطاق.
                    </p>
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 30px;
                    ">
                        <p style="margin-bottom: 10px;">
                            <strong>النطاق الحالي:</strong><br>
                            ${window.location.hostname}
                        </p>
                        <p>
                            <strong>النطاقات المسموحة:</strong><br>
                            wacelalorshe.github.io | jedwal.netlify.app
                        </p>
                    </div>
                    <a href="https://wacelalorshe.github.io/jedwal/" 
                       style="
                           display: inline-block;
                           padding: 15px 30px;
                           background: white;
                           color: #667eea;
                           text-decoration: none;
                           border-radius: 50px;
                           font-weight: bold;
                           font-size: 1.1rem;
                           transition: transform 0.3s;
                       "
                       onmouseover="this.style.transform='scale(1.05)'"
                       onmouseout="this.style.transform='scale(1)'">
                       🔗 الانتقال للموقع الرسمي
                    </a>
                    <p style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
                        🔒 محمية بواسطة نظام وسيل لايف برو الأمني
                    </p>
                </div>
            </div>
        `;
    }
}

// تفعيل نظام الحماية
window.firebaseProtection = new FirebaseProtection();
console.log("✅ نظام حماية Firebase مفعل بنجاح");
