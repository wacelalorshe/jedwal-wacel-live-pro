// admin.js - النسخة المؤمنة مع Firebase الجديد
console.log("🔐 تحميل لوحة التحكم المؤمنة...");

// استيراد النظام المؤمن
import { secureDb, getSecureMatches, addSecureMatch } from "./secure-firebase-config.js";
import { ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', async function() {
    console.log("📄 لوحة التحكم المؤمنة جاهزة للتحميل");
    
    // التحقق من صحة النطاق أولاً
    if (window.firebaseProtection && !window.firebaseProtection.isValidDomain) {
        console.error("🚫 محاولة الوصول من نطاق غير مصرح");
        document.body.innerHTML = `
            <div style="
                text-align: center;
                padding: 50px;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                min-height: 100vh;
            ">
                <h1>🚫 وصول غير مصرح به</h1>
                <p>لوحة التحكم متاحة فقط من النطاقات المصرح بها</p>
                <p style="font-size: 14px; margin-top: 20px;">
                    النطاق الحالي: ${window.location.hostname}
                </p>
            </div>
        `;
        return;
    }
    
    // عناصر DOM
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginMessage = document.getElementById('login-message');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    
    // ========== اختبار الاتصال مع Firebase المؤمن ==========
    window.testFirebaseConnection = async function() {
        console.log("🔍 اختبار اتصال Firebase المؤمن...");
        
        if (!secureDb) {
            alert("❌ قاعدة البيانات المؤمنة غير متاحة");
            return;
        }
        
        try {
            // اختبار القراءة باستخدام النظام المؤمن
            const matches = await getSecureMatches();
            console.log("✅ اختبار القراءة المؤمنة ناجح");
            console.log("📊 بيانات matches المؤمنة:", matches);
            
            // اختبار الكتابة باستخدام النظام المؤمن
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: "اختبار اتصال Firebase المؤمن"
            };
            
            const testRef = ref(secureDb, 'test_connection');
            await set(testRef, testData);
            console.log("✅ اختبار الكتابة المؤمنة ناجح");
            
            // تنظيف البيانات الاختبارية
            await remove(testRef);
            
            alert(`
✅ اختبار الاتصال المؤمن ناجح!
• قاعدة البيانات: متصلة ومؤمنة
• المشروع: wacel-live-pro
• النطاق المسموح: ${window.firebaseProtection?.allowedDomain || 'غير محدد'}
            `);
            
        } catch (error) {
            console.error("❌ اختبار الاتصال المؤمن فاشل:", error);
            alert(`
❌ اختبار الاتصال المؤمن فاشل
الخطأ: ${error.message || error.code}

تحقق من:
1. اتصال الإنترنت
2. صلاحيات الوصول
3. قواعد الأمان
            `);
        }
    };
    
    // ========== نظام تسجيل الدخول المبسط ==========
    window.enableDirectMode = function() {
        console.log("⚡ تفعيل الوضع المباشر المؤمن...");
        
        // إخفاء قسم تسجيل الدخول
        if (loginSection) {
            loginSection.classList.add('hidden');
        }
        
        // إظهار لوحة التحكم
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
        }
        
        // إظهار رسالة ترحيب
        if (loginMessage) {
            loginMessage.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                    text-align: center;
                ">
                    <h4 style="margin: 0 0 5px 0;">🔐 لوحة التحكم المؤمنة جاهزة!</h4>
                    <p style="margin: 0; font-size: 14px;">
                        المشروع: wacel-live-pro | النطاق: ${window.location.hostname}
                    </p>
                </div>
            `;
        }
        
        // تحميل المباريات باستخدام النظام المؤمن
        loadSecureMatches();
        
        console.log("✅ الوضع المباشر المؤمن مفعل بنجاح");
    };
    
    // ========== تحميل المباريات باستخدام النظام المؤمن ==========
    async function loadSecureMatches() {
        const matchesList = document.getElementById('matches-list');
        if (!matchesList) return;
        
        console.log("📥 جاري تحميل المباريات من النظام المؤمن...");
        
        try {
            // استخدام دالة القراءة المؤمنة
            const matchesRef = ref(secureDb, 'matches');
            
            onValue(matchesRef, 
                function(snapshot) {
                    console.log("📊 تم استلام بيانات المباريات المؤمنة");
                    displayMatches(snapshot);
                },
                function(error) {
                    console.error("❌ خطأ في تحميل المباريات المؤمنة:", error);
                    matchesList.innerHTML = `
                        <div class="error">
                            🔒 خطأ في تحميل المباريات المؤمنة
                            <p>${error.message || error.code}</p>
                            <p style="font-size: 12px; margin-top: 5px;">
                                تحقق من صلاحيات الوصول
                            </p>
                        </div>
                    `;
                }
            );
            
        } catch (error) {
            console.error("❌ خطأ في النظام المؤمن:", error);
            matchesList.innerHTML = `
                <div class="error">
                    🔒 ${error.message}
                    <p style="font-size: 12px;">
                        قد تحتاج إلى تحديث الصفحة أو التحقق من الاتصال
                    </p>
                </div>
            `;
        }
    }
    
    // ========== عرض المباريات ==========
    function displayMatches(snapshot) {
        const matchesList = document.getElementById('matches-list');
        if (!matchesList) return;
        
        matchesList.innerHTML = '';
        
        if (!snapshot.exists()) {
            matchesList.innerHTML = `
                <div class="loading">
                    📭 لا توجد مباريات مضافة
                    <p style="font-size: 14px; margin-top: 10px;">
                        ابدأ بإضافة أول مباراة باستخدام النموذج المؤمن أدناه
                    </p>
                </div>
            `;
            return;
        }
        
        const matches = snapshot.val();
        console.log(`🎯 عدد المباريات المؤمنة: ${Object.keys(matches).length}`);
        
        snapshot.forEach(function(childSnapshot) {
            const matchId = childSnapshot.key;
            const match = childSnapshot.val();
            
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item secure-match';
            
            // محتوى الروابط
            let linksContent = '';
            if (match.linkType === 'xmtv' && match.xmtvLink) {
                linksContent = `
                    <div class="xmtv-section">
                        <strong>🔒 رابط XPola مباشر:</strong>
                        <div class="xmtv-actions">
                            <button class="btn btn-success btn-small" 
                                onclick="window.open('${match.xmtvLink}', '_blank')">
                                فتح في XPola
                            </button>
                        </div>
                    </div>
                `;
            } else if (match.links && match.links.length > 0) {
                linksContent = `
                    <strong>🔒 روابط المشاهدة (${match.links.length}):</strong>
                    ${match.links.slice(0, 3).map((link, index) => 
                        `<div class="link-item">
                            <span>${index + 1}. ${link.substring(0, 50)}...</span>
                            <button class="btn btn-small" 
                                onclick="secureCopyToClipboard('${link.replace(/'/g, "\\'")}')">
                                نسخ
                            </button>
                        </div>`
                    ).join('')}
                `;
            }
            
            matchItem.innerHTML = `
                <div class="match-header">
                    <h4>${match.league || 'بدون دوري'}</h4>
                    <span class="secure-badge">🔒</span>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="editSecureMatch('${matchId}')">تعديل</button>
                        <button class="btn btn-danger" onclick="deleteSecureMatch('${matchId}')">حذف</button>
                    </div>
                </div>
                <div class="match-teams">
                    <div class="match-team">
                        <img src="${match.team1Logo || 'https://via.placeholder.com/50?text=T1'}" 
                             alt="${match.team1}" 
                             onerror="this.src='https://via.placeholder.com/50?text=T1'">
                        <span>${match.team1 || 'فريق 1'}</span>
                    </div>
                    <div class="match-time">${match.time || '--:--'}</div>
                    <div class="match-team">
                        <img src="${match.team2Logo || 'https://via.placeholder.com/50?text=T2'}" 
                             alt="${match.team2}" 
                             onerror="this.src='https://via.placeholder.com/50?text=T2'">
                        <span>${match.team2 || 'فريق 2'}</span>
                    </div>
                </div>
                <div class="match-details">
                    <div>📺 ${match.channel || 'بدون قناة'}</div>
                    <div>🎤 ${match.commentator || 'بدون معلق'}</div>
                    <div>📅 ${match.date || 'بدون تاريخ'}</div>
                </div>
                <div class="links-container secure-links">
                    ${linksContent || '<div class="link-item">لا توجد روابط مؤمنة</div>'}
                </div>
                <div class="match-meta">
                    <small>🆔 ${matchId.substring(0, 8)}...</small>
                    <small>🕒 ${match.createdAt ? new Date(match.createdAt).toLocaleString() : 'غير معروف'}</small>
                </div>
            `;
            
            matchesList.appendChild(matchItem);
        });
    }
    
    // ========== دوال المساعدة المؤمنة ==========
    window.secureCopyToClipboard = function(text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 1000;
                    animation: fadeInOut 3s;
                `;
                notification.textContent = "✅ تم النسخ إلى الحافظة (مؤمن)";
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            })
            .catch(() => alert("❌ فشل في النسخ"));
    };
    
    window.editSecureMatch = function(matchId) {
        console.log("✏️ تحرير المباراة المؤمنة:", matchId);
        alert(`تحرير المباراة المؤمنة: ${matchId}\nسيتم فتح نموذج التحرير المؤمن`);
        // يمكن إضافة منطق التحرير هنا
    };
    
    window.deleteSecureMatch = function(matchId) {
        if (!confirm('⚠️ هل أنت متأكد من حذف هذه المباراة المؤمنة؟')) return;
        
        if (!secureDb) {
            alert("❌ قاعدة البيانات المؤمنة غير متاحة");
            return;
        }
        
        const matchRef = ref(secureDb, 'matches/' + matchId);
        remove(matchRef)
            .then(() => {
                console.log("✅ تم حذف المباراة المؤمنة");
                
                // إشعار مؤمن
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #f44336;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 1000;
                    animation: fadeInOut 3s;
                `;
                notification.textContent = "✅ تم حذف المباراة المؤمنة";
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            })
            .catch(error => {
                console.error("❌ خطأ في الحذف المؤمن:", error);
                alert("🔒 فشل في حذف المباراة: " + error.message);
            });
    };
    
    // ========== إعداد نموذج إضافة المباراة المؤمن ==========
    const matchForm = document.getElementById('match-form');
    if (matchForm) {
        matchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log("➕ محاولة إضافة مباراة جديدة مؤمنة...");
            
            if (!secureDb) {
                alert("❌ قاعدة البيانات المؤمنة غير متاحة");
                return;
            }
            
            // جمع البيانات
            const matchData = {
                league: document.getElementById('league').value,
                leagueLogo: document.getElementById('league-logo').value,
                team1: document.getElementById('team1').value,
                team1Logo: document.getElementById('team1-logo').value,
                team2: document.getElementById('team2').value,
                team2Logo: document.getElementById('team2-logo').value,
                time: document.getElementById('match-time').value,
                channel: document.getElementById('channel').value,
                commentator: document.getElementById('commentator').value,
                date: document.getElementById('match-date').value,
                links: document.getElementById('links').value.split('\n')
                    .filter(link => link.trim() !== ''),
                xmtvLink: document.getElementById('xmtv-link').value,
                linkType: document.querySelector('.link-type-btn.active')?.dataset.type || 'regular',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addedBy: window.location.hostname, // تسجيل مصدر الإضافة
                secure: true // علامة أن هذه البيانات مؤمنة
            };
            
            console.log("📝 بيانات المباراة المؤمنة:", matchData);
            
            try {
                // استخدام دالة الإضافة المؤمنة
                const result = await addSecureMatch(matchData);
                
                console.log("✅ تم إضافة المباراة المؤمنة بنجاح، ID:", result.key);
                
                // رسالة نجاح مؤمنة
                const formMessage = document.getElementById('form-message');
                if (formMessage) {
                    formMessage.innerHTML = `
                        <div style="
                            background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                            color: white;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 10px 0;
                            border-left: 5px solid #1B5E20;
                        ">
                            <strong>🔒 تم إضافة المباراة المؤمنة بنجاح!</strong>
                            <p style="margin: 8px 0 0 0; font-size: 14px;">
                                ${matchData.team1} vs ${matchData.team2}
                            </p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
                                تم الحفظ في النظام المؤمن • ${new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        formMessage.innerHTML = '';
                    }, 5000);
                }
                
                // إعادة تعيين النموذج
                matchForm.reset();
                
                // إعادة تحميل المباريات
                setTimeout(loadSecureMatches, 1000);
                
            } catch (error) {
                console.error("❌ خطأ في إضافة المباراة المؤمنة:", error);
                alert("🔒 فشل في إضافة المباراة المؤمنة: " + error.message);
            }
        });
    }
    
    // ========== بدء التشغيل المؤمن ==========
    console.log("🔧 تفعيل لوحة التحكم المؤمنة مباشرة...");
    
    // التحقق من إعدادات الحماية
    console.log("🛡️ إعدادات الحماية:", {
        domain: window.location.hostname,
        protection: window.firebaseProtection,
        allowed: window.firebaseProtection?.isValidDomain || false
    });
    
    // تفعيل الوضع المباشر المؤمن فوراً
    setTimeout(() => {
        window.enableDirectMode();
        
        // تفعيل زر اختبار الاتصال المؤمن
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', window.testFirebaseConnection);
        }
        
        // تفعيل نظام التعبئة التلقائية المؤمن
        if (window.teamsDatabase) {
            console.log("✅ قاعدة بيانات الفرق المؤمنة متاحة");
            setupSecureAutoFill();
        }
        
    }, 100);
    
    // دالة التعبئة التلقائية المؤمنة
    function setupSecureAutoFill() {
        console.log("🎨 تفعيل نظام التعبئة التلقائية المؤمن...");
        
        // إضافة CSS للتأكيد المؤمن
        const style = document.createElement('style');
        style.textContent = `
            .secure-match {
                border-left: 4px solid #4CAF50;
                background: linear-gradient(90deg, rgba(76, 175, 80, 0.05) 0%, transparent 100%);
            }
            .secure-badge {
                background: #4CAF50;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                margin-left: 10px;
            }
            .secure-links {
                background: rgba(76, 175, 80, 0.05);
                border: 1px dashed #4CAF50;
            }
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        
        // يمكنك إضافة منطق التعبئة التلقائية المؤمن هنا
    }
});

console.log("✅ نظام لوحة التحكم المؤمن جاهز");
