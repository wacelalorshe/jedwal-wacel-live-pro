// نظام الحماية المحدث
console.log("🔒 تحميل نظام الحماية...");

class SiteProtection {
    constructor() {
        this.allowedDomains = [
            'wacelalorshe.github.io',
            'jedwal.netlify.app',
            'localhost', // للاختبار المحلي
            '127.0.0.1'  // للاختبار المحلي
        ];
        
        this.init();
    }
    
    init() {
        const currentDomain = window.location.hostname;
        console.log("🌐 المجال الحالي:", currentDomain);
        
        if (!this.checkDomain(currentDomain)) {
            console.warn("⚠️ الوصول من مجال غير مصرح:", currentDomain);
            this.showWarning();
        } else {
            console.log("✅ الوصول من مجال مصرح");
        }
    }
    
    checkDomain(domain) {
        for (const allowed of this.allowedDomains) {
            if (domain.includes(allowed)) {
                return true;
            }
        }
        return false;
    }
    
    showWarning() {
        // لا نحظر الموقع، فقط نعرض تحذير
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #fff3cd;
            color: #856404;
            padding: 10px 15px;
            border-radius: 5px;
            border: 1px solid #ffeaa7;
            z-index: 9999;
            font-size: 12px;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        warning.innerHTML = `
            <strong>⚠️ تحذير</strong>
            <p style="margin: 5px 0 0 0;">أنت تتصفح من مجال غير رسمي</p>
            <a href="https://wacelalorshe.github.io/jedwal/" 
               style="color: #007bff; text-decoration: none; font-size: 11px;">
               الانتقال للموقع الرسمي
            </a>
        `;
        document.body.appendChild(warning);
        
        // إزالة التحذير بعد 10 ثواني
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }
}

// تشغيل الحماية
new SiteProtection();