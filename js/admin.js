// admin.js - النسخة المحدثة مع Firebase الجديد
console.log("🚀 تحميل لوحة التحكم مع Firebase الجديد...");

// استيراد Firebase
import { db, auth } from "./firebase-config.js";
import { 
    ref, onValue, push, update, remove, set, get 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', async function() {
    console.log("📄 لوحة التحكم جاهزة للتحميل");
    
    // عناصر DOM
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginMessage = document.getElementById('login-message');
    const testConnectionBtn = document.getElementById('test-connection-btn');
    
    // ========== اختبار الاتصال مع Firebase الجديد ==========
    window.testFirebaseConnection = async function() {
        console.log("🔍 اختبار اتصال Firebase الجديد...");
        
        if (!db) {
            alert("❌ قاعدة البيانات غير متاحة");
            return;
        }
        
        const formMessage = document.getElementById('form-message');
        
        try {
            // اختبار قراءة البيانات
            const snapshot = await get(ref(db, 'matches'));
            console.log("✅ اختبار القراءة ناجح");
            console.log("📊 بيانات matches:", snapshot.val());
            
            // اختبار الكتابة
            const testRef = ref(db, 'test_connection');
            await set(testRef, {
                timestamp: new Date().toISOString(),
                message: "اختبار اتصال Firebase الجديد"
            });
            console.log("✅ اختبار الكتابة ناجح");
            
            // تنظيف البيانات الاختبارية
            await remove(testRef);
            
            alert(`
✅ اختبار الاتصال ناجح!
• قاعدة البيانات: متصلة
• عدد المباريات: ${snapshot.size}
• المشروع: wacel-live-pro
            `);
            
        } catch (error) {
            console.error("❌ اختبار الاتصال فاشل:", error);
            alert(`
❌ اختبار الاتصال فاشل
الخطأ: ${error.message || error.code}

تحقق من:
1. اتصال الإنترنت
2. قواعد أمان قاعدة البيانات
3. إعدادات Firebase Console
            `);
        }
    };
    
    // ========== نظام تسجيل الدخول المبسط ==========
    window.enableDirectMode = function() {
        console.log("⚡ تفعيل الوضع المباشر...");
        
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
                    <h4 style="margin: 0 0 5px 0;">🎉 لوحة التحكم جاهزة!</h4>
                    <p style="margin: 0; font-size: 14px;">المشروع: wacel-live-pro</p>
                </div>
            `;
        }
        
        // تحميل المباريات
        loadMatches();
        
        console.log("✅ الوضع المباشر مفعل بنجاح");
    };
    
    // ========== تحميل المباريات ==========
    async function loadMatches() {
        const matchesList = document.getElementById('matches-list');
        if (!matchesList) return;
        
        console.log("📥 جاري تحميل المباريات من Firebase...");
        
        if (!db) {
            matchesList.innerHTML = '<div class="error">❌ قاعدة البيانات غير متاحة</div>';
            return;
        }
        
        try {
            const matchesRef = ref(db, 'matches');
            
            onValue(matchesRef, 
                function(snapshot) {
                    console.log("📊 تم استلام بيانات المباريات");
                    displayMatches(snapshot);
                },
                function(error) {
                    console.error("❌ خطأ في تحميل المباريات:", error);
                    matchesList.innerHTML = `
                        <div class="error">
                            ❌ خطأ في تحميل المباريات
                            <p>${error.message || error.code}</p>
                        </div>
                    `;
                }
            );
            
        } catch (error) {
            console.error("❌ خطأ:", error);
            matchesList.innerHTML = `<div class="error">❌ ${error.message}</div>`;
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
                        ابدأ بإضافة أول مباراة باستخدام النموذج أعلاه
                    </p>
                </div>
            `;
            return;
        }
        
        const matches = snapshot.val();
        console.log(`🎯 عدد المباريات: ${Object.keys(matches).length}`);
        
        snapshot.forEach(function(childSnapshot) {
            const matchId = childSnapshot.key;
            const match = childSnapshot.val();
            
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            
            // محتوى الروابط
            let linksContent = '';
            if (match.linkType === 'xmtv' && match.xmtvLink) {
                linksContent = `
                    <div class="xmtv-section">
                        <strong>🔗 رابط XPola مباشر:</strong>
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
                    <strong>🔗 روابط المشاهدة (${match.links.length}):</strong>
                    ${match.links.slice(0, 3).map((link, index) => 
                        `<div class="link-item">
                            <span>${index + 1}. ${link.substring(0, 50)}...</span>
                            <button class="btn btn-small" 
                                onclick="copyToClipboard('${link.replace(/'/g, "\\'")}')">
                                نسخ
                            </button>
                        </div>`
                    ).join('')}
                `;
            }
            
            matchItem.innerHTML = `
                <div class="match-header">
                    <h4>${match.league || 'بدون دوري'}</h4>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="editMatch('${matchId}')">تعديل</button>
                        <button class="btn btn-danger" onclick="deleteMatch('${matchId}')">حذف</button>
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
                <div class="links-container">
                    ${linksContent || '<div class="link-item">لا توجد روابط</div>'}
                </div>
            `;
            
            matchesList.appendChild(matchItem);
        });
    }
    
    // ========== دوال المساعدة ==========
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text)
            .then(() => alert("✅ تم النسخ إلى الحافظة"))
            .catch(() => alert("❌ فشل في النسخ"));
    };
    
    window.editMatch = function(matchId) {
        console.log("✏️ تحرير المباراة:", matchId);
        alert(`سيتم تحرير المباراة: ${matchId}\nهذه الميزة تحت التطوير`);
    };
    
    window.deleteMatch = function(matchId) {
        if (!confirm('⚠️ هل أنت متأكد من حذف هذه المباراة؟')) return;
        
        if (!db) {
            alert("❌ قاعدة البيانات غير متاحة");
            return;
        }
        
        const matchRef = ref(db, 'matches/' + matchId);
        remove(matchRef)
            .then(() => {
                console.log("✅ تم حذف المباراة");
                alert("✅ تم حذف المباراة بنجاح");
            })
            .catch(error => {
                console.error("❌ خطأ في الحذف:", error);
                alert("❌ فشل في حذف المباراة: " + error.message);
            });
    };
    
    // ========== إعداد نموذج إضافة المباراة ==========
    const matchForm = document.getElementById('match-form');
    if (matchForm) {
        matchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log("➕ محاولة إضافة مباراة جديدة...");
            
            if (!db) {
                alert("❌ قاعدة البيانات غير متاحة");
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
                updatedAt: new Date().toISOString()
            };
            
            console.log("📝 بيانات المباراة:", matchData);
            
            try {
                const matchesRef = ref(db, 'matches');
                const result = await push(matchesRef, matchData);
                
                console.log("✅ تم إضافة المباراة بنجاح، ID:", result.key);
                
                // رسالة نجاح
                const formMessage = document.getElementById('form-message');
                if (formMessage) {
                    formMessage.innerHTML = `
                        <div style="
                            background: #d4edda;
                            color: #155724;
                            padding: 12px;
                            border-radius: 5px;
                            margin: 10px 0;
                        ">
                            ✅ تم إضافة المباراة بنجاح في Firebase!
                            <p style="margin: 5px 0 0 0; font-size: 14px;">
                                ${matchData.team1} vs ${matchData.team2}
                            </p>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        formMessage.innerHTML = '';
                    }, 3000);
                }
                
                // إعادة تعيين النموذج
                matchForm.reset();
                
                // إعادة تحميل المباريات
                setTimeout(loadMatches, 1000);
                
            } catch (error) {
                console.error("❌ خطأ في إضافة المباراة:", error);
                alert("❌ فشل في إضافة المباراة: " + error.message);
            }
        });
    }
    
    // ========== بدء التشغيل ==========
    console.log("🔧 تفعيل لوحة التحكم مباشرة...");
    
    // تفعيل الوضع المباشر فوراً
    setTimeout(() => {
        window.enableDirectMode();
        
        // تفعيل زر اختبار الاتصال
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', window.testFirebaseConnection);
        }
        
        // تفعيل نظام التعبئة التلقائية
        if (window.teamsDatabase) {
            console.log("✅ قاعدة بيانات الفرق متاحة");
            setupAutoFill();
        }
        
    }, 100);
    
    // دالة التعبئة التلقائية
    function setupAutoFill() {
        console.log("🎨 تفعيل نظام التعبئة التلقائية...");
        // يمكنك إضافة منطق التعبئة التلقائية هنا
    }
});

console.log("✅ نظام لوحة التحكم جاهز مع Firebase الجديد");