<!DOCTYPE html>
<!-- ============================================
admin.html
صفحة لوحة التحكم للإدارة
للتحكم في جميع محتويات التطبيق
============================================ -->
<html lang="ar" dir="rtl">
<head>
    <!-- ============================================
    الجزء 1: إعدادات الميتا الأساسية
    ============================================ -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة الإدارة - وسيل لايف برو</title> <!-- 🔹 عنوان صفحة الإدارة -->
    
    <!-- ============================================
    الجزء 2: مكتبات CSS الخارجية
    ============================================ -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"> <!-- 🔹 Bootstrap للتصميم -->
    <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"> <!-- 🔹 أيقونات Uni -->
    
    <!-- ============================================
    الجزء 3: ملفات CSS المخصصة
    ============================================ -->
    <link rel="stylesheet" href="css/admin.css"> <!-- 🔹 أنماط خاصة بلوحة التحكم -->
    
    <!-- ============================================
    الجزء 4: CSS المضمن في الصفحة
    ============================================ -->
    <style>
        /* 🔹 إعدادات عامة للوحة التحكم */
        body {
            background: linear-gradient(135deg, #1a1a2e, #16213e); /* 🔹 خلفية متدرجة */
            color: #E1E1E1; /* 🔹 لون النص */
            font-family: 'Cairo', sans-serif; /* 🔹 خط عربي */
            min-height: 100vh; /* 🔹 ملء الشاشة بالكامل */
            padding: 20px; /* 🔹 مسافات خارجية */
        }
        
        /* 🔹 حاوية لوحة التحكم الرئيسية */
        .admin-container {
            max-width: 1400px; /* 🔹 أقصى عرض */
            margin: 0 auto; /* 🔹 توسيط أفقي */
        }
        
        /* 🔹 العنوان الرئيسي للوحة التحكم */
        h1 {
            color: #E1E1E1; /* 🔹 لون النص */
            text-shadow: 0 2px 4px rgba(0,0,0,0.5); /* 🔹 ظل للنص */
            font-size: 2.5rem; /* 🔹 حجم الخط */
            margin-bottom: 10px; /* 🔹 مسافة سفلى */
        }
        
        /* 🔹 رسالة حالة Firebase */
        .firebase-status {
            padding: 15px; /* 🔹 مسافات داخلية */
            border-radius: 10px; /* 🔹 زوايا دائرية */
            margin-bottom: 20px; /* 🔹 مسافة سفلى */
            display: none; /* 🔹 مخفية افتراضياً */
            align-items: center; /* 🔹 توسيط عمودي */
        }
        
        /* 🔹 حالة نجاح Firebase */
        .firebase-success {
            background: rgba(40, 167, 69, 0.2); /* 🔹 خلفية خضراء شفافة */
            border: 1px solid #28a745; /* 🔹 حد أخضر */
            color: #28a745; /* 🔹 لون أخضر */
        }
        
        /* 🔹 حالة خطأ Firebase */
        .firebase-error {
            background: rgba(220, 53, 69, 0.2); /* 🔹 خلفية حمراء شفافة */
            border: 1px solid #dc3545; /* 🔹 حد أحمر */
            color: #dc3545; /* 🔹 لون أحمر */
        }
        
        /* 🔹 حالة تحذير Firebase */
        .firebase-warning {
            background: rgba(255, 193, 7, 0.2); /* 🔹 خلفية صفراء شفافة */
            border: 1px solid #ffc107; /* 🔹 حد أصفر */
            color: #ffc107; /* 🔹 لون أصفر */
        }
        
        /* 🔹 لوحة الإدارة الرئيسية */
        .admin-panel {
            background: rgba(0, 0, 0, 0.7); /* 🔹 خلفية سوداء شفافة */
            border-radius: 15px; /* 🔹 زوايا دائرية */
            padding: 30px; /* 🔹 مسافات داخلية */
            border: 1px solid #42318F; /* 🔹 حد بنفسجي */
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); /* 🔹 ظل خفيف */
        }
        
        /* 🔹 رسالة تسجيل الدخول المطلوب */
        .login-required {
            text-align: center; /* 🔹 توسيط النص */
            padding: 50px 20px; /* 🔹 مسافات داخلية */
            background: rgba(0, 0, 0, 0.7); /* 🔹 خلفية سوداء شفافة */
            border-radius: 15px; /* 🔹 زوايا دائرية */
            border: 2px solid #FF5200; /* 🔹 حد برتقالي */
        }
        
        /* 🔹 بطاقات الإحصائيات */
        .stats-card {
            background: linear-gradient(135deg, #2F2562, #42318F); /* 🔹 خلفية متدرجة */
            border-radius: 10px; /* 🔹 زوايا دائرية */
            padding: 20px; /* 🔹 مسافات داخلية */
            text-align: center; /* 🔹 توسيط النص */
            border: 1px solid #42318F; /* 🔹 حد بنفسجي */
            transition: transform 0.3s; /* 🔹 تأثير عند المرور */
        }
        
        /* 🔹 تأثير عند المرور على بطاقات الإحصائيات */
        .stats-card:hover {
            transform: translateY(-5px); /* 🔹 رفع بسيط */
            border-color: #654FD4; /* 🔹 تغيير لون الحد */
        }
        
        /* 🔹 رقم الإحصائية */
        .stats-number {
            font-size: 2.5rem; /* 🔹 حجم كبير */
            font-weight: bold; /* 🔹 نص عريض */
            color: white; /* 🔹 لون أبيض */
            margin-bottom: 10px; /* 🔹 مسافة سفلى */
        }
        
        /* 🔹 تسمية الإحصائية */
        .stats-label {
            color: #B8B8B8; /* 🔹 لون رمادي */
            font-size: 14px; /* 🔹 حجم صغير */
        }
        
        /* 🔹 تبويبات التنقل في لوحة التحكم */
        .nav-tabs-custom {
            border-bottom: 2px solid #42318F; /* 🔹 خط سفلي */
        }
        
        /* 🔹 روابط التبويبات */
        .nav-tabs-custom .nav-link {
            color: #B8B8B8; /* 🔹 لون رمادي */
            border: none; /* 🔹 إزالة الحدود */
            border-radius: 10px 10px 0 0; /* 🔹 زوايا علوية دائرية */
            padding: 12px 24px; /* 🔹 مسافات داخلية */
            margin: 0 5px; /* 🔹 مسافات خارجية */
            background: transparent; /* 🔹 خلفية شفافة */
        }
        
        /* 🔹 رابط التبويب النشط */
        .nav-tabs-custom .nav-link.active {
            background: linear-gradient(135deg, #42318F, #654FD4); /* 🔹 خلفية متدرجة */
            color: white; /* 🔹 لون أبيض */
            border: none; /* 🔹 إزالة الحدود */
        }
        
        /* 🔹 تأثير عند المرور على روابط التبويبات */
        .nav-tabs-custom .nav-link:hover:not(.active) {
            background: rgba(66, 49, 143, 0.3); /* 🔹 خلفية شفافة */
            color: white; /* 🔹 لون أبيض */
        }
        
        /* 🔹 محتوى التبويبات */
        .tab-content {
            padding: 30px 0; /* 🔹 مسافات داخلية */
        }
        
        /* 🔹 بطاقات النماذج */
        .card {
            background: rgba(0,0,0,0.7); /* 🔹 خلفية سوداء شفافة */
            border: 1px solid #42318F; /* 🔹 حد بنفسجي */
            border-radius: 15px; /* 🔹 زوايا دائرية */
            margin-bottom: 30px; /* 🔹 مسافة سفلى */
        }
        
        /* 🔹 رأس البطاقات المخصص */
        .card-header-custom {
            background: linear-gradient(135deg, #2F2562, #42318F); /* 🔹 خلفية متدرجة */
            border-bottom: 1px solid #42318F; /* 🔹 حد سفلي */
            color: white; /* 🔹 لون أبيض */
            border-radius: 15px 15px 0 0 !important; /* 🔹 زوايا علوية دائرية */
            padding: 20px; /* 🔹 مسافات داخلية */
        }
        
        /* 🔹 حقول الإدخال في النماذج */
        .form-control {
            background: rgba(255, 255, 255, 0.1); /* 🔹 خلفية بيضاء شفافة */
            border: 1px solid #42318F; /* 🔹 حد بنفسجي */
            color: white; /* 🔹 لون أبيض */
            border-radius: 8px; /* 🔹 زوايا دائرية */
            padding: 12px 15px; /* 🔹 مسافات داخلية */
        }
        
        /* 🔹 تأثير عند التركيز على حقول الإدخال */
        .form-control:focus {
            background: rgba(255, 255, 255, 0.15); /* 🔹 تفتيح الخلفية */
            border-color: #654FD4; /* 🔹 تغيير لون الحد */
            color: white; /* 🔹 لون أبيض */
            box-shadow: 0 0 0 0.25rem rgba(101, 79, 212, 0.25); /* 🔹 ظل أزرق */
        }
        
        /* 🔹 تسميات الحقول */
        .form-label {
            color: #B8B8B8; /* 🔹 لون رمادي */
            margin-bottom: 8px; /* 🔹 مسافة سفلى */
            font-weight: 500; /* 🔹 نص متوسط السماكة */
        }
        
        /* 🔹 الأزرار العامة */
        .btn {
            border-radius: 8px; /* 🔹 زوايا دائرية */
            padding: 10px 20px; /* 🔹 مسافات داخلية */
            font-weight: bold; /* 🔹 نص عريض */
            border: none; /* 🔹 إزالة الحدود */
            transition: all 0.3s; /* 🔹 تأثيرات عند المرور */
        }
        
        /* 🔹 زر أساسي (لون رئيسي) */
        .btn-primary {
            background: linear-gradient(135deg, #42318F, #654FD4); /* 🔹 خلفية متدرجة */
            color: white; /* 🔹 لون أبيض */
        }
        
        /* 🔹 تأثير عند المرور على الزر الأساسي */
        .btn-primary:hover {
            background: linear-gradient(135deg, #654FD4, #42318F); /* 🔹 عكس التدرج */
            transform: translateY(-2px); /* 🔹 رفع بسيط */
            box-shadow: 0 5px 15px rgba(101, 79, 212, 0.4); /* 🔹 ظل أزرق */
        }
        
        /* 🔹 زر النجاح (أخضر) */
        .btn-success {
            background: linear-gradient(135deg, #28a745, #20c997); /* 🔹 خلفية متدرجة خضراء */
            color: white; /* 🔹 لون أبيض */
        }
        
        /* 🔹 تأثير عند المرور على زر النجاح */
        .btn-success:hover {
            background: linear-gradient(135deg, #20c997, #28a745); /* 🔹 عكس التدرج */
            transform: translateY(-2px); /* 🔹 رفع بسيط */
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4); /* 🔹 ظل أخضر */
        }
        
        /* 🔹 زر التحذير (أصفر/برتقالي) */
        .btn-warning {
            background: linear-gradient(135deg, #ffc107, #fd7e14); /* 🔹 خلفية متدرجة صفراء */
            color: black; /* 🔹 لون أسود */
        }
        
        /* 🔹 تأثير عند المرور على زر التحذير */
        .btn-warning:hover {
            background: linear-gradient(135deg, #fd7e14, #ffc107); /* 🔹 عكس التدرج */
            transform: translateY(-2px); /* 🔹 رفع بسيط */
        }
        
        /* 🔹 زر الخطر (أحمر) */
        .btn-danger {
            background: linear-gradient(135deg, #dc3545, #c82333); /* 🔹 خلفية متدرجة حمراء */
            color: white; /* 🔹 لون أبيض */
        }
        
        /* 🔹 تأثير عند المرور على زر الخطر */
        .btn-danger:hover {
            background: linear-gradient(135deg, #c82333, #dc3545); /* 🔹 عكس التدرج */
            transform: translateY(-2px); /* 🔹 رفع بسيط */
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4); /* 🔹 ظل أحمر */
        }
        
        /* 🔹 زر المعلومات (أزرق فاتح) */
        .btn-info {
            background: linear-gradient(135deg, #17a2b8, #138496); /* 🔹 خلفية متدرجة زرقاء */
            color: white; /* 🔹 لون أبيض */
        }
        
        /* 🔹 تأثير عند المرور على زر المعلومات */
        .btn-info:hover {
            background: linear-gradient(135deg, #138496, #17a2b8); /* 🔹 عكس التدرج */
            transform: translateY(-2px); /* 🔹 رفع بسيط */
        }
        
        /* 🔹 العناصر في القوائم (الأقسام، القنوات، المباريات) */
        .section-item, .channel-item, .match-item, .notification-item {
            background: rgba(255, 255, 255, 0.05); /* 🔹 خلفية بيضاء شفافة */
            padding: 15px; /* 🔹 مسافات داخلية */
            margin-bottom: 10px; /* 🔹 مسافة سفلى */
            border-radius: 10px; /* 🔹 زوايا دائرية */
            border: 1px solid rgba(66, 49, 143, 0.3); /* 🔹 حد شفاف */
            transition: all 0.3s; /* 🔹 تأثيرات */
        }
        
        /* 🔹 تأثير عند المرور على العناصر */
        .section-item:hover, .channel-item:hover, .match-item:hover, .notification-item:hover {
            background: rgba(66, 49, 143, 0.2); /* 🔹 خلفية بنفسجية شفافة */
            border-color: #654FD4; /* 🔹 تغيير لون الحد */
        }
        
        /* 🔹 معاينة الصور */
        .section-image-preview {
            max-width: 200px; /* 🔹 أقصى عرض */
            max-height: 200px; /* 🔹 أقصى ارتفاع */
            margin-top: 10px; /* 🔹 مسافة علوية */
            border-radius: 10px; /* 🔹 زوايا دائرية */
            border: 2px solid #42318F; /* 🔹 حد بنفسجي */
            display: none; /* 🔹 مخفية افتراضياً */
        }
        
        /* 🔹 النص الثانوي */
        .text-muted {
            color: #B8B8B8 !important; /* 🔹 لون رمادي */
        }
        
        /* 🔹 التجاوب مع الشاشات الصغيرة (الموبايل) */
        @media (max-width: 768px) {
            .admin-container {
                padding: 10px; /* 🔹 تقليل المسافات */
            }
            
            h1 {
                font-size: 1.8rem; /* 🔹 تقليل حجم العنوان */
            }
            
            .stats-number {
                font-size: 2rem; /* 🔹 تقليل حجم الأرقام */
            }
            
            .nav-tabs-custom .nav-link {
                padding: 8px 12px; /* 🔹 تقليل المسافات */
                font-size: 14px; /* 🔹 تقليل حجم الخط */
            }
        }
    </style>
</head>
<body>
    <!-- ============================================
    الجزء 5: هيكل HTML للوحة التحكم
    ============================================ -->
    
    <!-- 🔹 الحاوية الرئيسية للوحة التحكم -->
    <div class="admin-container">
        <div class="row">
            <div class="col-12">
                <!-- 🔹 رأس الصفحة مع العنوان والوصف -->
                <div class="text-center mb-5">
                    <h1 style="color: #E1E1E1; text-shadow: 0 2px 4px rgba(0,0,0,0.5); font-size: 2.5rem;">
                        <i class="uil uil-setting"></i> لوحة إدارة وسيل لايف برو
                    </h1>
                    <p class="text-muted">إدارة القنوات والأقسام والإشعارات والمباريات - التعديل والحذف والإضافة</p>
                </div>

                <!-- 🔹 رسالة حالة اتصال Firebase (تظهر ديناميكياً) -->
                <div id="firebaseStatus" class="firebase-status" style="display: none;">
                    <i class="uil uil-info-circle"></i>
                    <span id="firebaseStatusText">جاري التحقق من اتصال قاعدة البيانات...</span>
                </div>
                
                <!-- 🔹 لوحة الإدارة الرئيسية (تظهر بعد تسجيل الدخول) -->
                <div id="adminPanel" class="admin-panel" style="display: none;">
                    <!-- 🔹 محتوى التحميل الابتدائي -->
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <p class="mt-3">جاري تحميل لوحة التحكم...</p>
                    </div>
                </div>

                <!-- 🔹 رسالة تسجيل الدخول المطلوب (تظهر إذا لم يكن المستخدم مسجلاً) -->
                <div id="loginRequired" class="login-required" style="display: none;">
                    <div class="mb-4">
                        <i class="uil uil-lock-alt" style="font-size: 80px; color: #FF5200;"></i>
                    </div>
                    <h3 class="text-white mb-3">يجب تسجيل الدخول أولاً</h3>
                    <p class="text-white mb-4" style="font-size: 18px;">يرجى تسجيل الدخول من الصفحة الرئيسية للوصول إلى لوحة الإدارة</p>
                    <a href="index.html" class="btn btn-primary btn-lg">
                        <i class="uil uil-signin"></i> العودة للرئيسية لتسجيل الدخول
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================
    الجزء 6: مكتبات JavaScript
    ============================================ -->
    
    <!-- 🔹 مكتبة Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>

    <!-- 🔹 مكتبة Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- ============================================
    الجزء 7: ملفات JavaScript المخصصة
    ============================================ -->
    
    <!-- 🔹 ملف إعدادات Firebase -->
    <script src="js/firebase-config.js"></script>
    
    <!-- 🔹 ملف لوحة التحكم (الإدارة) -->
    	<script>
    console.log('قبل تحميل admin.js...');
    console.log('Firebase:', typeof firebase);
</script>
    
    <script src="js/admin.js"></script>
    
    <!-- ============================================
    الجزء 8: كود JavaScript مضمّن في الصفحة
    ============================================ -->
    <script>
        // 🔹 هذا الكود يعمل عند تحميل الصفحة بالكامل
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🔧 تم تحميل صفحة لوحة التحكم');
            
            // 🔹 التحقق من حالة تسجيل الدخول
            const isAdmin = localStorage.getItem('isAdmin') === 'true';
            const user = localStorage.getItem('user');
            
            if (isAdmin && user) {
                console.log('👤 المستخدم مسجل دخول كمسؤول:', JSON.parse(user).email);
                
                // 🔹 بدء مدير لوحة التحكم إذا كان موجوداً
                if (typeof adminManager !== 'undefined') {
                    console.log('🚀 بدء مدير لوحة التحكم');
                }
            } else {
                console.log('❌ المستخدم غير مسجل دخول كمسؤول');
                // 🔹 عرض رسالة تسجيل الدخول المطلوب
                document.getElementById('loginRequired').style.display = 'block';
            }
        });
        
        // 🔹 دالة للعودة للصفحة الرئيسية
        function goToHomePage() {
            window.location.href = 'index.html';
        }
        
        // 🔹 دالة لتسجيل الخروج من لوحة التحكم
        function logout() {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
        
        // 🔹 دالة للتحقق من اتصال Firebase
        function checkFirebaseConnection() {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                console.log('✅ Firebase متصل في لوحة التحكم');
                return true;
            } else {
                console.log('❌ Firebase غير متصل في لوحة التحكم');
                return false;
            }
        }
        
        // 🔹 دالة لإعادة تحميل لوحة التحكم
        function reloadAdminPanel() {
            if (typeof adminManager !== 'undefined') {
                adminManager.retryFirebaseConnection();
            }
        }
    </script>
</body>
</html>
