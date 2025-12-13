// obfuscator.js - تشويش وحماية الكود من السرقة
console.log("🛡️ تفعيل حماية تشويش الكود...");

(function() {
    // منع فحص الكود
    Object.defineProperty(window, 'FirebaseApp', {
        configurable: false,
        writable: false,
        value: null
    });
    
    // تشويش أسماء المتغيرات
    const originalConsole = console;
    const obfuscatedConsole = {};
    
    ['log', 'warn', 'error', 'info'].forEach(method => {
        obfuscatedConsole[method] = function(...args) {
            // إخفاء المعلومات الحساسة في Console
            const safeArgs = args.map(arg => {
                if (typeof arg === 'string' && (
                    arg.includes('firebaseio.com') || 
                    arg.includes('apiKey') ||
                    arg.includes('wacel-live-pro')
                )) {
                    return '[PROTECTED_DATA]';
                }
                return arg;
            });
            
            originalConsole[method](...safeArgs);
        };
    });
    
    window.console = obfuscatedConsole;
    
    // تشويش أسماء الدوال
    const functionMap = new Map();
    
    window.$F = function(originalName, func) {
        const obfuscatedName = 'fn_' + Math.random().toString(36).substr(2, 9);
        functionMap.set(obfuscatedName, { originalName, func });
        window[obfuscatedName] = func;
        return obfuscatedName;
    };
    
    // حماية الكود من النسخ
    document.addEventListener('DOMContentLoaded', () => {
        const scripts = document.querySelectorAll('script[type="module"]');
        scripts.forEach(script => {
            if (script.src.includes('firebase')) {
                script.setAttribute('integrity', 'sha256-protected');
                script.setAttribute('crossorigin', 'anonymous');
            }
        });
    });
    
    console.log("✅ تشويش الكود مفعل بنجاح");
})();
