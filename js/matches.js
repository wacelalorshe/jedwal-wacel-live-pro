// ============================================
// matches.js - النسخة المعدلة مع إضافة خيار عدم المشاهدة مرة أخرى
// ============================================

class MatchApp {
    constructor() {
        this.matchesList = [];
        this.channelsList = [];
        this.hasAppInstalled = localStorage.getItem('app_installed') === 'true';
        this.dontShowAgain = localStorage.getItem('dont_show_modal') === 'true';
        this.currentFilter = 'today';
        this.isFirebaseAvailable = false;
        
        this.initializeApp();
    }

    // ============================================
    // 🔹 الجزء 1: دوال التهيئة
    // ============================================

    async initializeApp() {
        console.log('⚽ بدء تشغيل جدول المباريات...');
        this.setCurrentYear();
        await this.loadAllData();
        this.setupUserInterface();
        console.log('✅ تم تهيئة جدول المباريات بنجاح');
    }

    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    async loadAllData() {
        console.log('📥 جاري تحميل بيانات المباريات...');
        this.showLoadingState();
        
        try {
            try {
                await this.loadDataFromFirebase();
                console.log('✅ تم تحميل البيانات من Firebase');
            } catch (firebaseError) {
                console.warn('⚠️ فشل تحميل Firebase:', firebaseError.message);
                try {
                    await this.loadDataFromLocalStorage();
                    console.log('✅ تم تحميل البيانات من localStorage');
                } catch (localStorageError) {
                    console.warn('⚠️ فشل تحميل localStorage:', localStorageError.message);
                    this.loadDefaultData();
                    console.log('✅ تم تحميل البيانات الافتراضية');
                }
            }
        } catch (error) {
            console.error('❌ خطأ عام في تحميل البيانات:', error);
            this.showErrorMessage('حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        }
    }

    // ============================================
    // 🔹 الجزء 2: دوال تحميل البيانات
    // ============================================

    async loadDataFromFirebase() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('🔥 جاري تحميل البيانات من Firebase...');
                
                if (typeof firebase === 'undefined') {
                    throw new Error('Firebase SDK غير محمل');
                }
                
                let db;
                if (window.firebaseApp && window.firebaseApp.getDB) {
                    db = window.firebaseApp.getDB();
                } else {
                    const firebaseConfig = {
                        apiKey: "AIzaSyAkgEiYYlmpMe0NLewulheovlTQMz5C980",
                        authDomain: "bein-42f9e.firebaseapp.com",
                        projectId: "bein-42f9e",
                        storageBucket: "bein-42f9e.firebasestorage.app",
                        messagingSenderId: "143741167050",
                        appId: "1:143741167050:web:922d3a0cddb40f67b21b33",
                        measurementId: "G-JH198SKCFS"
                    };
                    
                    if (!firebase.apps.length) {
                        firebase.initializeApp(firebaseConfig);
                    }
                    db = firebase.firestore();
                }
                
                if (!db) throw new Error('قاعدة البيانات غير متاحة');
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let matchesSnapshot;
                try {
                    matchesSnapshot = await db.collection('matches')
                        .where('matchDate', '>=', today)
                        .orderBy('matchDate')
                        .orderBy('matchTime')
                        .get();
                } catch (queryError) {
                    console.warn('⚠️ خطأ في استعلام المباريات:', queryError);
                    matchesSnapshot = await db.collection('matches').get();
                }
                
                if (matchesSnapshot.empty) {
                    console.log('ℹ️ لا توجد مباريات في قاعدة البيانات');
                    this.matchesList = [];
                } else {
                    this.matchesList = matchesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    console.log(`✅ تم تحميل ${this.matchesList.length} مباراة`);
                }
                
                try {
                    const channelsSnapshot = await db.collection('channels').get();
                    if (channelsSnapshot.empty) {
                        console.log('ℹ️ لا توجد قنوات في قاعدة البيانات');
                        this.channelsList = [];
                    } else {
                        this.channelsList = channelsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        console.log(`✅ تم تحميل ${this.channelsList.length} قناة`);
                    }
                } catch (channelError) {
                    console.warn('⚠️ خطأ في تحميل القنوات:', channelError);
                    this.channelsList = [];
                }
                
                this.saveDataToLocalStorage();
                this.isFirebaseAvailable = true;
                this.renderMatches();
                resolve(true);
                
            } catch (error) {
                console.error('❌ فشل تحميل Firebase:', error);
                this.isFirebaseAvailable = false;
                reject(error);
            }
        });
    }

    async loadDataFromLocalStorage() {
        return new Promise((resolve, reject) => {
            try {
                console.log('💾 جاري تحميل البيانات من التخزين المحلي...');
                
                const savedMatches = localStorage.getItem('bein_matches');
                if (!savedMatches) {
                    throw new Error('لا توجد بيانات محلية للمباريات');
                }
                
                this.matchesList = JSON.parse(savedMatches);
                console.log(`✅ تم تحميل ${this.matchesList.length} مباراة من localStorage`);
                
                const savedChannels = localStorage.getItem('bein_channels');
                if (savedChannels) {
                    this.channelsList = JSON.parse(savedChannels);
                    console.log(`✅ تم تحميل ${this.channelsList.length} قناة من localStorage`);
                } else {
                    this.channelsList = [];
                }
                
                this.renderMatches();
                resolve(true);
                
            } catch (error) {
                console.error('❌ فشل تحميل البيانات المحلية:', error);
                reject(error);
            }
        });
    }

    loadDefaultData() {
        console.log('📋 استخدام البيانات الافتراضية...');
        
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        this.matchesList = [
            {
                id: 'match1',
                team1: 'النادي الأهلي',
                team2: 'النادي الهلالي',
                competition: 'الدوري السعودي',
                matchDate: today.toISOString().split('T')[0],
                matchTime: '20:00',
                channelId: 'channel1',
                status: 'upcoming'
            },
            {
                id: 'match2',
                team1: 'برشلونة',
                team2: 'ريال مدريد',
                competition: 'الدوري الإسباني',
                matchDate: today.toISOString().split('T')[0],
                matchTime: '22:00',
                channelId: 'channel2',
                status: 'upcoming'
            }
        ];
        
        this.channelsList = [
            {
                id: 'channel1',
                name: 'بي إن سبورت 1',
                image: 'https://via.placeholder.com/200x100/2F2562/FFFFFF?text=BEIN+1',
                url: 'https://www.example.com/channel1',
                appUrl: 'https://play.google.com/store/apps/details?id=com.xpola.player'
            },
            {
                id: 'channel2',
                name: 'بي إن سبورت 2',
                image: 'https://via.placeholder.com/200x100/2F2562/FFFFFF?text=BEIN+2',
                url: 'https://www.example.com/channel2',
                appUrl: 'https://play.google.com/store/apps/details?id=com.xpola.player'
            }
        ];
        
        this.saveDataToLocalStorage();
        this.renderMatches();
    }

    saveDataToLocalStorage() {
        try {
            localStorage.setItem('bein_matches', JSON.stringify(this.matchesList));
            localStorage.setItem('bein_channels', JSON.stringify(this.channelsList));
            console.log('💾 تم حفظ البيانات في التخزين المحلي');
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات محلياً:', error);
        }
    }

    // ============================================
    // 🔹 الجزء 3: دوال عرض الواجهة
    // ============================================

    showLoadingState() {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <div class="spinner" style="width: 50px; height: 50px; border: 5px solid #654FD4; border-top: 5px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <style>
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                    <p style="color: #fff; font-size: 18px;">جاري تحميل المباريات...</p>
                    <small style="color: #B8B8B8;">يرجى الانتظار</small>
                </div>
            `;
        }
    }

    showErrorMessage(message) {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <i class="uil uil-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
                    <p style="color: #FF5200; font-size: 16px; margin-top: 20px;">${message}</p>
                    <div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 20px auto;">
                        <button onclick="window.matchApp.retryLoadData()" style="background: linear-gradient(135deg, #42318F, #654FD4); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="uil uil-redo"></i> إعادة المحاولة
                        </button>
                        <button onclick="window.matchApp.useLocalData()" style="background: rgba(66, 49, 143, 0.3); color: white; border: 1px solid #654FD4; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="uil uil-database"></i> استخدام البيانات المحلية
                        </button>
                    </div>
                </div>
            `;
        }
    }

    renderMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) {
            console.error('❌ حاوية المباريات غير موجودة');
            return;
        }

        const filteredMatches = this.filterMatchesByDate(this.currentFilter);
        
        if (filteredMatches.length === 0) {
            let message = '';
            switch(this.currentFilter) {
                case 'today': message = 'لا توجد مباريات اليوم'; break;
                case 'tomorrow': message = 'لا توجد مباريات غداً'; break;
                case 'week': message = 'لا توجد مباريات هذا الأسبوع'; break;
                default: message = 'لا توجد مباريات متاحة';
            }
            
            container.innerHTML = `
                <div class="no-matches">
                    <i class="uil uil-calendar-slash" style="font-size: 60px; color: #6c757d; margin-bottom: 20px;"></i>
                    <h4 style="color: #fff; margin-bottom: 10px;">${message}</h4>
                    <p style="color: #B8B8B8;">سيتم إضافة المباريات قريباً</p>
                </div>
            `;
            return;
        }

        console.log(`🎯 عرض ${filteredMatches.length} مباراة`);
        
        container.innerHTML = `
            <div class="matches-grid">
                ${filteredMatches.map(match => this.createMatchCard(match)).join('')}
            </div>
        `;

        this.addMatchClickListeners();
        console.log('✅ تم عرض المباريات بنجاح');
    }

    // 🔹 تحديث دالة createMatchCard في matches.js
// 🔹 تحديث دالة createMatchCard في matches.js
// 🔹 تحديث دالة createMatchCard لجعل الأيقونة بجانب النص
createMatchCard(match) {
    const channel = this.channelsList.find(c => c.id === match.channelId);
    const now = new Date();
    const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}`);
    
    // حالة المباراة
    let status = 'upcoming', statusText = 'تبدا قريبآ', statusIcon = 'uil uil-clock';
    if (match.status === 'live' || match.isLive) {
        status = 'live'; statusText = 'مباشر'; statusIcon = 'uil uil-play-circle';
    } else if (matchDateTime < now) {
        status = 'finished'; statusText = 'انتهت المباراة'; statusIcon = 'uil uil-check-circle';
    }
    
    const formattedDate = this.formatMatchDate(match.matchDate);
    const formattedTime = this.formatTimeEnglish(match.matchTime);
    
    return `
        <div class="match-card" data-match-id="${match.id}">
            <!-- أسماء الفرقين -->
            <div class="match-teams">
                <div class="teams-container">
                    <div class="team">
                        <div class="team-logo-container">
                            <i class="uil uil-football"></i>
                        </div>
                        <div class="team-name glow">${match.team1}</div>
                    </div>
                    
                    <div class="vs-container">
                        <div class="vs">VS</div>
                        <div class="match-time-small">${formattedTime}</div>
                    </div>
                    
                    <div class="team">
                        <div class="team-logo-container">
                            <i class="uil uil-football"></i>
                        </div>
                        <div class="team-name glow">${match.team2}</div>
                    </div>
                </div>
            </div>
            
            <!-- حالة المباراة -->
            <div class="match-status-container">
                <div class="match-status ${status}">
                    <i class="${statusIcon}"></i>
                    ${statusText}
                </div>
                </div>
            <!-- زر المشاهدة -->
            <div class="watch-btn-container">
                <button class="watch-btn" onclick="window.matchApp.openMatch('${match.id}'); event.stopPropagation()">
                    <i class="uil uil-play-circle"></i> مشاهدة المباراة
                </button>
            </div>
            
            
            <!-- قسم معلومات المباراة (أيقونة بجانب النص) -->
            <div class="match-info-horizontal">
                <!-- القناة -->
                <div class="info-item channel" title="${channel ? channel.name : 'قناة غير محددة'}">
                    <div class="info-content">
                        <i class="uil uil-tv-retro info-icon"></i>
                        <div class="info-text">
                            <div class="info-label">القناة</div>
                            <div class="info-value">${channel ? channel.name : 'غير محدد'}</div>
                        </div>
                    </div>
                </div>
                
                <!-- التاريخ -->
                <div class="info-item date" title="تاريخ المباراة">
                    <div class="info-content">
                        <i class="uil uil-calendar-alt info-icon"></i>
                        <div class="info-text">
                            <div class="info-label">التاريخ</div>
                            <div class="info-value">${formattedDate}</div>
                        </div>
                    </div>
                </div>
                
                <!-- البطولة -->
                <div class="info-item league" title="${match.competition || 'بطولة'}">
                    <div class="info-content">
                        <i class="uil uil-trophy info-icon"></i>
                        <div class="info-text">
                            <div class="info-label">البطولة</div>
                            <div class="info-value">${match.competition || 'غير محدد'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            </div>
        </div>
    `;
}

// 🔹 تحديث دالة formatMatchDate لجعل التاريخ أقصر
formatMatchDate(dateString) {
    if (!dateString) return '--/--';
    try {
        const date = new Date(dateString);
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const dayName = days[date.getDay()];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        // تنسيق مختصر: الاثنين 12/15
        return `${dayName} ${month}/${day}`;
    } catch (error) {
        return '--/--';
    }
}

// 🔹 دالة formatTimeEnglish (تبقى كما هي)
formatTimeEnglish(timeString) {
    if (!timeString) return '--:--';
    try {
        const [hours, minutes] = timeString.split(':');
        
        const arabicToEnglish = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };
        
        let hourNum = hours;
        let minuteNum = minutes || '00';
        
        if (/\u0660-\u0669/.test(hourNum)) {
            hourNum = hourNum.split('').map(char => arabicToEnglish[char] || char).join('');
        }
        if (/\u0660-\u0669/.test(minuteNum)) {
            minuteNum = minuteNum.split('').map(char => arabicToEnglish[char] || char).join('');
        }
        
        hourNum = parseInt(hourNum, 10);
        minuteNum = parseInt(minuteNum, 10);
        
        return `${hourNum}:${minuteNum < 10 ? '0' + minuteNum : minuteNum}`;
    } catch (error) {
        return timeString;
    }
}

    formatMatchDate(dateString) {
        if (!dateString) return 'غير محدد';
        try {
            const date = new Date(dateString);
            const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const dayName = days[date.getDay()];
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${dayName} ${month}/${day}`;
        } catch (error) {
            return 'غير محدد';
        }
    }

    formatTimeEnglish(timeString) {
        if (!timeString) return '--:--';
        try {
            const [hours, minutes] = timeString.split(':');
            const arabicToEnglish = {
                '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
                '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
            };
            
            let hourNum = hours;
            if (/\u0660-\u0669/.test(hourNum)) {
                hourNum = hourNum.split('').map(char => arabicToEnglish[char] || char).join('');
            }
            
            let minuteNum = minutes || '00';
            if (/\u0660-\u0669/.test(minuteNum)) {
                minuteNum = minuteNum.split('').map(char => arabicToEnglish[char] || char).join('');
            }
            
            hourNum = parseInt(hourNum, 10);
            minuteNum = parseInt(minuteNum, 10);
            const formattedMinute = minuteNum < 10 ? `0${minuteNum}` : minuteNum;
            
            return `${hourNum}:${formattedMinute}`;
        } catch (error) {
            return timeString;
        }
    }

    // ============================================
    // 🔹 الجزء 4: دوال الفلترة
    // ============================================

    filterMatchesByDate(filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return this.matchesList.filter(match => {
            if (!match.matchDate) return false;
            const matchDate = new Date(match.matchDate);
            matchDate.setHours(0, 0, 0, 0);
            
            switch(filter) {
                case 'today': return matchDate.getTime() === today.getTime();
                case 'tomorrow': return matchDate.getTime() === tomorrow.getTime();
                case 'week': return matchDate >= today && matchDate <= nextWeek;
                case 'all': return true;
                default: return matchDate.getTime() === today.getTime();
            }
        });
    }

    filterMatches(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.date-btn[onclick*="filterMatches('${filter}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderMatches();
    }

    // ============================================
    // 🔹 الجزء 5: دوال إدارة المباريات
    // ============================================

    openMatch(matchId) {
        const match = this.matchesList.find(m => m.id === matchId);
        if (!match) return;
        
        console.log(`▶️ فتح المباراة: ${match.team1} vs ${match.team2}`);
        
        if (!match.channelId) {
            this.showErrorMessage('لم يتم تحديد قناة لهذه المباراة');
            return;
        }
        
        const channel = this.channelsList.find(c => c.id === match.channelId);
        if (!channel) {
            this.showErrorMessage('القناة الناقلة غير متاحة');
            return;
        }
        
        // التحقق من إعداد عدم عرض النافذة
        if (this.dontShowAgain) {
            // إذا اختار المستخدم عدم المشاهدة مرة أخرى، فتح القناة مباشرة
            this.openChannel(channel);
        } else {
            // عرض نافذة التأكيد
            this.showInstallModal(channel);
        }
    }

    // 🔹 الدالة: showInstallModal
    showInstallModal(channel) {
        // إزالة أي نافذة موجودة مسبقاً
        const existingModal = document.getElementById('installModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        // إنشاء نافذة جديدة مع خيار عدم المشاهدة مرة أخرى
        const modalHTML = `
            <div id="installModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(#16213e, #1a1a2e); border-radius: 15px; padding: 30px; max-width: 450px; width: 90%; border: 2px solid #654FD4; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
                    <i class="uil uil-mobile-android-alt" style="font-size: 50px; color: #654FD4; margin-bottom: 20px;"></i>
                    <h3 style="color: white; margin-bottom: 10px;">مشاهدة المباراة</h3>
                    <p style="color: #B8B8B8; margin-bottom: 25px;">اختر الطريقة التي تريد بها مشاهدة المباراة</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button id="installAppBtn" style="background: linear-gradient(135deg, #FF5200, #FF0005); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="uil uil-download-alt"></i> تثبيت التطبيق ومشاهدة
                        </button>
                        <button id="openChannelBtn" style="background: linear-gradient(135deg, #42318F, #654FD4); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="uil uil-play-circle"></i> مشاهدة مباشرة
                        </button>
                        <button id="dontShowAgainBtn" style="background: rgba(184, 184, 184, 0.2); color: #B8B8B8; border: 1px solid #B8B8B8; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <i class="uil uil-ban"></i> عدم المشاهدة مرة أخرى
                        </button>
                        <button id="cancelModalBtn" style="background: transparent; color: #FF5200; border: 1px solid #FF5200; padding: 10px 20px; border-radius: 25px; cursor: pointer; margin-top: 10px;">
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);
        
        // إضافة مستمعي الأحداث
        document.getElementById('installAppBtn').addEventListener('click', () => {
            this.installApp(channel);
            document.body.removeChild(modalDiv);
        });
        
        document.getElementById('openChannelBtn').addEventListener('click', () => {
            this.openChannel(channel);
            document.body.removeChild(modalDiv);
        });
        
        document.getElementById('dontShowAgainBtn').addEventListener('click', () => {
            this.setDontShowAgain(channel);
            document.body.removeChild(modalDiv);
        });
        
        document.getElementById('cancelModalBtn').addEventListener('click', () => {
            document.body.removeChild(modalDiv);
        });
    }

    // 🔹 الدالة: setDontShowAgain
    setDontShowAgain(channel) {
        console.log('🚫 تم تعيين عدم عرض النافذة مرة أخرى');
        
        // حفظ التفضيل في localStorage
        this.dontShowAgain = true;
        localStorage.setItem('dont_show_modal', 'true');
        
        // عرض رسالة تأكيد
        this.showConfirmationMessage('لن تظهر هذه النافذة مرة أخرى. يمكنك تغيير هذا الإعداد من إعدادات التطبيق.');
        
        // فتح القناة مباشرة
        this.openChannel(channel);
    }

    // 🔹 الدالة: showConfirmationMessage
    showConfirmationMessage(message) {
        // إزالة أي رسالة موجودة مسبقاً
        const existingMsg = document.getElementById('confirmationMessage');
        if (existingMsg) {
            document.body.removeChild(existingMsg);
        }
        
        const messageHTML = `
            <div id="confirmationMessage" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.8); color: white; padding: 15px 25px; border-radius: 25px; z-index: 10001; border: 1px solid #654FD4;">
                <i class="uil uil-check-circle" style="color: #4CAF50; margin-right: 10px;"></i>
                ${message}
            </div>
        `;
        
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = messageHTML;
        document.body.appendChild(messageDiv);
        
        // إزالة الرسالة بعد 3 ثواني
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 3000);
    }

    // 🔹 الدالة: installApp
    installApp(channel) {
        console.log('📱 تثبيت التطبيق...');
        
        // فتح رابط التحميل في نافذة جديدة
        const appUrl = channel.appUrl || 'https://play.google.com/store/apps/details?id=com.xpola.player';
        window.open(appUrl, '_blank');
        
        // تعيين التطبيق كمثبت
        this.hasAppInstalled = true;
        localStorage.setItem('app_installed', 'true');
        
        // فتح القناة بعد 3 ثواني
        setTimeout(() => {
            this.openChannel(channel);
        }, 3000);
    }

    // 🔹 الدالة: openChannel
    openChannel(channel) {
        console.log(`📺 فتح القناة: ${channel.name}`);
        
        if (!channel.url || channel.url === '#') {
            // عرض البث في iframe إذا كان الرابط غير متوفر
            this.showStreamInIframe(channel);
            return;
        }
        
        // فتح رابط البث في نافذة جديدة
        window.open(channel.url, '_blank');
        this.logMatchView(channel);
    }

    // 🔹 الدالة: showStreamInIframe
    showStreamInIframe(channel) {
        // إزالة أي نافذة موجودة مسبقاً
        const existingStream = document.getElementById('streamModal');
        if (existingStream) {
            document.body.removeChild(existingStream);
        }
        
        const streamHTML = `
            <div id="streamModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10001; display: flex; align-items: center; justify-content: center;">
                <div style="width: 95%; max-width: 800px; background: #1a1a2e; border-radius: 15px; overflow: hidden; border: 2px solid #654FD4;">
                    <div style="padding: 15px; background: #16213e; display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="color: white; margin: 0;">${channel.name}</h4>
                        <button id="closeStream" style="background: #FF5200; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">×</button>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <p style="color: #B8B8B8;">رابط البث غير متوفر حالياً</p>
                        <p style="color: #FF5200; margin-top: 20px;">يرجى تثبيت التطبيق لمشاهدة المباراة</p>
                        <button onclick="window.open('https://play.google.com/store/apps/details?id=com.xpola.player', '_blank')" style="background: linear-gradient(135deg, #FF5200, #FF0005); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; margin-top: 20px;">
                            <i class="uil uil-download-alt"></i> تثبيت التطبيق
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const streamDiv = document.createElement('div');
        streamDiv.innerHTML = streamHTML;
        document.body.appendChild(streamDiv);
        
        // إضافة مستمع حدث لإغلاق النافذة
        document.getElementById('closeStream').addEventListener('click', () => {
            document.body.removeChild(streamDiv);
        });
    }

    // ============================================
    // 🔹 الجزء 6: دوال مساعدة
    // ============================================

    setupUserInterface() {
        window.filterMatches = (filter) => this.filterMatches(filter);
        
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        }
        
        // إضافة زر لإعادة تفعيل النافذة المنبثقة (للإعدادات)
        this.addSettingsButton();
    }

    // 🔹 الدالة: addSettingsButton
    addSettingsButton() {
        // البحث عن شريط التنقل أو مكان مناسب لوضع الزر
        const nav = document.querySelector('nav') || document.querySelector('.navbar') || document.querySelector('.header');
        if (nav) {
            const settingsBtn = document.createElement('button');
            settingsBtn.innerHTML = '<i class="uil uil-setting"></i>';
            settingsBtn.style.background = 'transparent';
            settingsBtn.style.color = 'white';
            settingsBtn.style.border = '1px solid #654FD4';
            settingsBtn.style.borderRadius = '50%';
            settingsBtn.style.width = '40px';
            settingsBtn.style.height = '40px';
            settingsBtn.style.cursor = 'pointer';
            settingsBtn.style.marginLeft = '10px';
            settingsBtn.title = 'إعدادات العرض';
            
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
            
            nav.appendChild(settingsBtn);
        }
    }

    // 🔹 الدالة: showSettingsModal
    showSettingsModal() {
        const modalHTML = `
            <div id="settingsModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10002; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(#16213e, #1a1a2e); border-radius: 15px; padding: 30px; max-width: 400px; width: 90%; border: 2px solid #654FD4; text-align: center;">
                    <h3 style="color: white; margin-bottom: 20px;"><i class="uil uil-setting"></i> إعدادات العرض</h3>
                    
                    <div style="text-align: right; margin-bottom: 20px;">
                        <label style="color: #B8B8B8; display: flex; align-items: center; justify-content: space-between; padding: 10px; background: rgba(101, 79, 212, 0.1); border-radius: 8px;">
                            <span>عرض نافذة المشاهدة</span>
                            <input type="checkbox" id="showModalToggle" ${this.dontShowAgain ? '' : 'checked'} 
                                   style="transform: scale(1.2);">
                        </label>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="saveSettings" style="background: linear-gradient(135deg, #42318F, #654FD4); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">
                            حفظ
                        </button>
                        <button id="closeSettings" style="background: transparent; color: #B8B8B8; border: 1px solid #B8B8B8; padding: 12px 25px; border-radius: 25px; cursor: pointer;">
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = modalHTML;
        document.body.appendChild(modalDiv);
        
        // إضافة مستمعي الأحداث
        document.getElementById('saveSettings').addEventListener('click', () => {
            const showModal = document.getElementById('showModalToggle').checked;
            this.dontShowAgain = !showModal;
            localStorage.setItem('dont_show_modal', this.dontShowAgain ? 'true' : 'false');
            
            // عرض رسالة تأكيد
            this.showConfirmationMessage(
                showModal ? 
                'تم تفعيل عرض نافذة المشاهدة' : 
                'تم إيقاف عرض نافذة المشاهدة'
            );
            
            document.body.removeChild(modalDiv);
        });
        
        document.getElementById('closeSettings').addEventListener('click', () => {
            document.body.removeChild(modalDiv);
        });
    }

    addMatchClickListeners() {
        const matchCards = document.querySelectorAll('.match-card');
        matchCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.watch-btn')) {
                    const matchId = card.getAttribute('data-match-id');
                    this.openMatch(matchId);
                }
            });
        });
    }

    logMatchView(channel) {
        try {
            console.log(`📊 تسجيل مشاهدة المباراة على القناة: ${channel.name}`);
        } catch (error) {
            console.warn('⚠️ فشل تسجيل المشاهدة:', error);
        }
    }

    retryLoadData() {
        console.log('🔄 إعادة محاولة تحميل بيانات المباريات...');
        this.loadAllData();
    }

    useLocalData() {
        this.loadDataFromLocalStorage();
    }
}

// ============================================
// 🔹 تهيئة التطبيق
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📂 تهيئة صفحة المباريات...');
    window.matchApp = new MatchApp();
});

// 🔹 دوال مساعدة متاحة عالمياً
window.reloadMatchesData = function() {
    if (window.matchApp) {
        window.matchApp.retryLoadData();
    }
};

window.updateMatches = function(matches) {
    if (window.matchApp) {
        window.matchApp.matchesList = matches;
        window.matchApp.saveDataToLocalStorage();
        window.matchApp.renderMatches();
    }
};

window.updateChannels = function(channels) {
    if (window.matchApp) {
        window.matchApp.channelsList = channels;
        window.matchApp.saveDataToLocalStorage();
        window.matchApp.renderMatches();
    }
};

// 🔹 دالة لإعادة تفعيل النافذة المنبثقة
window.resetModalSettings = function() {
    localStorage.removeItem('dont_show_modal');
    if (window.matchApp) {
        window.matchApp.dontShowAgain = false;
        alert('تم إعادة تفعيل نافذة المشاهدة');
    }
};

console.log("✅ تم تحميل matches.js بنسخته النهائية مع خيار عدم المشاهدة مرة أخرى");
