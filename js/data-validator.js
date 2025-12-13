// data-validator.js - التحقق من صحة وسلامة البيانات
console.log("✅ تحميل مدقق البيانات...");

class DataValidator {
    static validateMatchData(matchData) {
        const errors = [];
        
        // التحقق من الحقول المطلوبة
        const requiredFields = ['league', 'team1', 'team2', 'time', 'channel'];
        requiredFields.forEach(field => {
            if (!matchData[field] || matchData[field].trim() === '') {
                errors.push(`حقل ${field} مطلوب`);
            }
        });
        
        // التحقق من صحة الروابط
        if (matchData.links && Array.isArray(matchData.links)) {
            matchData.links.forEach((link, index) => {
                if (!this.isValidUrl(link)) {
                    errors.push(`الرابط رقم ${index + 1} غير صالح`);
                }
            });
        }
        
        // التحقق من صحة وقت المباراة
        if (matchData.time && !this.isValidTime(matchData.time)) {
            errors.push('تنسيق الوقت غير صحيح (استخدم 08:00م)');
        }
        
        // التحقق من العلامة المائية
        if (matchData.__watermark && !window.firebaseProtection?.verifyWatermark?.(matchData)) {
            errors.push('البيانات غير موثوقة أو تم التلاعب بها');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    static isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }
    
    static isValidTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]([صم]|ص\.م|م\.ص)?$/;
        return timeRegex.test(time);
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // إزالة السكريبتات الضارة
        const sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/javascript:/gi, '')
            .trim();
        
        return sanitized;
    }
}

window.DataValidator = DataValidator;
console.log("✅ مدقق البيانات جاهز للاستخدام");
