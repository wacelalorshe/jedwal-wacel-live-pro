// ============================================
// matches.js - نسخة معدلة ومحسنة
// تطبيق عرض جدول المباريات مع دعم Firebase المحسن
// ============================================

// 🔹 فئة MatchApp - تطبيق جدول المباريات
class MatchApp {
    constructor() {
        // 🔹 خصائص التطبيق
        this.matchesList = [];                    // 🔹 قائمة المباريات
        this.channelsList = [];                   // 🔹 قائمة القنوات
        this.hasAppInstalled = false;             // 🔹 حالة تثبيت التطبيق
        this.currentFilter = 'today';             // 🔹 الفلتر الحالي
        this.isFirebaseAvailable = false;         // 🔹 حالة اتصال Firebase
        
        // 🔹 بدء التطبيق
        this.initializeApp();
    }

    // ============================================
    // 🔹 الجزء 1: دوال التهيئة
    // ============================================

    // 🔹 الدالة: initializeApp
    // 🔹 الوظيفة: تهيئة التطبيق بالكامل
    // 🔹 الاستخدام: عند إنشاء كائن MatchApp
    async initializeApp() {
        console.log('⚽ بدء تشغيل جدول المباريات...');
        
        // 🔹 تعيين السنة الحالية
        this.setCurrentYear();
        
        // 🔹 تحميل البيانات
        await this.loadAllData();
        
        // 🔹 إعداد واجهة المستخدم
        this.setupUserInterface();
        
        console.log('✅ تم تهيئة جدول المباريات بنجاح');
    }

    // 🔹 الدالة: setCurrentYear
    // 🔹 الوظيفة: تعيين السنة الحالية في الفوتر
    // 🔹 الاستخدام: في initializeApp
    setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // 🔹 الدالة: loadAllData
    // 🔹 الوظيفة: تحميل جميع البيانات
    // 🔹 الاستخدام: في initializeApp
    async loadAllData() {
        console.log('📥 جاري تحميل بيانات المباريات...');
        
        // 🔹 عرض حالة التحميل
        this.showLoadingState();
        
        try {
            // 🔹 محاولة التحميل من Firebase
            try {
                await this.loadDataFromFirebase();
                console.log('✅ تم تحميل البيانات من Firebase');
            } catch (firebaseError) {
                console.warn('⚠️ فشل تحميل Firebase:', firebaseError.message);
                
                // 🔹 المحاولة الثانية: من localStorage
                try {
                    await this.loadDataFromLocalStorage();
                    console.log('✅ تم تحميل البيانات من localStorage');
                } catch (localStorageError) {
                    console.warn('⚠️ فشل تحميل localStorage:', localStorageError.message);
                    
                    // 🔹 المحاولة الثالثة: البيانات الافتراضية
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

    // 🔹 الدالة: loadDataFromFirebase
    // 🔹 الوظيفة: تحميل البيانات من Firebase
    // 🔹 الاستخدام: عندما يكون اتصال Firebase متاحاً
    async loadDataFromFirebase() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('🔥 جاري تحميل البيانات من Firebase...');
                
                // 🔹 التحقق من وجود Firebase SDK
                if (typeof firebase === 'undefined') {
                    throw new Error('Firebase SDK غير محمل');
                }
                
                // 🔹 استخدام الدوال الموحدة من firebase-init.js
                let db;
                if (window.firebaseApp && window.firebaseApp.getDB) {
                    db = window.firebaseApp.getDB();
                } else {
                    // 🔹 الطريقة البديلة
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
                
                if (!db) {
                    throw new Error('قاعدة البيانات غير متاحة');
                }
                
                // 🔹 جلب بيانات المباريات
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
                    // 🔹 محاولة بديلة
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
                
                // 🔹 جلب بيانات القنوات
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
                
                // 🔹 حفظ نسخة محلية
                this.saveDataToLocalStorage();
                
                // 🔹 تحديث حالة Firebase
                this.isFirebaseAvailable = true;
                
                // 🔹 عرض المباريات
                this.renderMatches();
                
                resolve(true);
                
            } catch (error) {
                console.error('❌ فشل تحميل Firebase:', error);
                this.isFirebaseAvailable = false;
                reject(error);
            }
        });
    }

    // 🔹 الدالة: loadDataFromLocalStorage
    // 🔹 الوظيفة: تحميل البيانات من التخزين المحلي
    // 🔹 الاستخدام: عند عدم توفر اتصال Firebase
    async loadDataFromLocalStorage() {
        return new Promise((resolve, reject) => {
            try {
                console.log('💾 جاري تحميل البيانات من التخزين المحلي...');
                
                // 🔹 جلب المباريات
                const savedMatches = localStorage.getItem('bein_matches');
                if (!savedMatches) {
                    throw new Error('لا توجد بيانات محلية للمباريات');
                }
                
                this.matchesList = JSON.parse(savedMatches);
                console.log(`✅ تم تحميل ${this.matchesList.length} مباراة من localStorage`);
                
                // 🔹 جلب القنوات
                const savedChannels = localStorage.getItem('bein_channels');
                if (savedChannels) {
                    this.channelsList = JSON.parse(savedChannels);
                    console.log(`✅ تم تحميل ${this.channelsList.length} قناة من localStorage`);
                } else {
                    this.channelsList = [];
                }
                
                // 🔹 عرض المباريات
                this.renderMatches();
                
                resolve(true);
                
            } catch (error) {
                console.error('❌ فشل تحميل البيانات المحلية:', error);
                reject(error);
            }
        });
    }

    // 🔹 الدالة: loadDefaultData
    // 🔹 الوظيفة: تحميل البيانات الافتراضية
    // 🔹 الاستخدام: عند فشل جميع مصادر البيانات
    loadDefaultData() {
        console.log('📋 استخدام البيانات الافتراضية...');
        
        // 🔹 بيانات مباريات افتراضية
        this.matchesList = [
            {
                id: 'match1',
                team1: 'النادي الأهلي',
                team2: 'النادي الهلالي',
                competition: 'الدوري السعودي',
                matchDate: new Date().toISOString().split('T')[0],
                matchTime: '20:00',
                channelId: 'channel1',
                status: 'upcoming'
            },
            {
                id: 'match2',
                team1: 'برشلونة',
                team2: 'ريال مدريد',
                competition: 'الدوري الإسباني',
                matchDate: new Date().toISOString().split('T')[0],
                matchTime: '22:00',
                channelId: 'channel2',
                status: 'upcoming'
            }
        ];
        
        // 🔹 بيانات قنوات افتراضية
        this.channelsList = [
            {
                id: 'channel1',
                name: 'بي إن سبورت 1',
                image: 'https://via.placeholder.com/200x100/2F2562/FFFFFF?text=BEIN+1',
                url: '#',
                appUrl: 'https://play.google.com/store/apps/details?id=com.xpola.player'
            },
            {
                id: 'channel2',
                name: 'بي إن سبورت 2',
                image: 'https://via.placeholder.com/200x100/2F2562/FFFFFF?text=BEIN+2',
                url: '#',
                appUrl: 'https://play.google.com/store/apps/details?id=com.xpola.player'
            }
        ];
        
        // 🔹 حفظ نسخة محلية
        this.saveDataToLocalStorage();
        
        // 🔹 عرض المباريات
        this.renderMatches();
    }

    // 🔹 الدالة: saveDataToLocalStorage
    // 🔹 الوظيفة: حفظ البيانات في التخزين المحلي
    // 🔹 الاستخدام: بعد تحميل البيانات من Firebase
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

    // 🔹 الدالة: showLoadingState
    // 🔹 الوظيفة: عرض حالة التحميل
    // 🔹 الاستخدام: أثناء تحميل البيانات
    showLoadingState() {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1;">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p>جاري تحميل المباريات...</p>
                    <small>يرجى الانتظار</small>
                </div>
            `;
        }
    }

    // 🔹 الدالة: showErrorMessage
    // 🔹 الوظيفة: عرض رسالة خطأ
    // 🔹 الاستخدام: عند فشل تحميل البيانات
    showErrorMessage(message) {
        const container = document.getElementById('matchesContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1;">
                    <i class="uil uil-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
                    <p class="mt-3 text-danger">${message}</p>
                    <div class="d-flex flex-column gap-2 mt-3">
                        <button class="btn btn-primary" onclick="window.matchApp.retryLoadData()">
                            <i class="uil uil-redo"></i> إعادة المحاولة
                        </button>
                        <button class="btn btn-secondary" onclick="window.matchApp.useLocalData()">
                            <i class="uil uil-database"></i> استخدام البيانات المحلية
                        </button>
                        <button class="btn btn-info" onclick="window.open('index.html', '_self')">
                            <i class="uil uil-home"></i> العودة للرئيسية
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // 🔹 الدالة: renderMatches
    // 🔹 الوظيفة: عرض المباريات في الواجهة
    // 🔹 الاستخدام: بعد تحميل البيانات
    renderMatches() {
        const container = document.getElementById('matchesContainer');
        if (!container) {
            console.error('❌ حاوية المباريات غير موجودة');
            return;
        }

        // 🔹 تصفية المباريات حسب التاريخ
        const filteredMatches = this.filterMatchesByDate(this.currentFilter);
        
        if (filteredMatches.length === 0) {
            let message = '';
            switch(this.currentFilter) {
                case 'today':
                    message = 'لا توجد مباريات اليوم';
                    break;
                case 'tomorrow':
                    message = 'لا توجد مباريات غداً';
                    break;
                case 'week':
                    message = 'لا توجد مباريات هذا الأسبوع';
                    break;
                default:
                    message = 'لا توجد مباريات متاحة';
            }
            
            container.innerHTML = `
                <div class="no-matches">
                    <i class="uil uil-calendar-slash"></i>
                    <h4>${message}</h4>
                    <p>سيتم إضافة المباريات قريباً</p>
                </div>
            `;
            return;
        }

        console.log(`🎯 عرض ${filteredMatches.length} مباراة`);
        
        // 🔹 إنشاء HTML للمباريات
        container.innerHTML = `
            <div class="matches-grid">
                ${filteredMatches.map(match => this.createMatchCard(match)).join('')}
            </div>
        `;

        // 🔹 إضافة مستمعي الأحداث للمباريات
        this.addMatchClickListeners();
        
        console.log('✅ تم عرض المباريات بنجاح');
    }

    // 🔹 الدالة: createMatchCard
    // 🔹 الوظيفة: إنشاء بطاقة مباراة
    // 🔹 الاستخدام: في renderMatches
    createMatchCard(match) {
        // 🔹 البحث عن القناة المرتبطة بالمباراة
        const channel = this.channelsList.find(c => c.id === match.channelId);
        const defaultImage = 'https://via.placeholder.com/200x100/2F2562/FFFFFF?text=TV';
        
        // 🔹 تحديد حالة المباراة
        const now = new Date();
        const matchDateTime = new Date(`${match.matchDate}T${match.matchTime}`);
        let status = 'upcoming';
        let statusText = 'قادمة';
        
        if (match.status === 'live' || match.isLive) {
            status = 'live';
            statusText = 'مباشر';
        } else if (matchDateTime < now) {
            status = 'finished';
            statusText = 'منتهية';
        }
        
        // 🔹 تنسيق الوقت
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const matchTime = matchDateTime.toLocaleTimeString('ar-SA', timeOptions);
        
        return `
            <div class="match-card" data-match-id="${match.id}">
                <div class="match-status ${status}">${statusText}</div>
                <div class="match-teams">
                    <div class="team">${match.team1}</div>
                    <div class="vs">VS</div>
                    <div class="team">${match.team2}</div>
                </div>
                <div class="match-details">
                    <div class="detail">
                        <i class="uil uil-trophy"></i>
                        <span>${match.competition || 'بطولة'}</span>
                    </div>
                    <div class="detail">
                        <i class="uil uil-calendar-alt"></i>
                        <span>${this.formatMatchDate(match.matchDate)}</span>
                    </div>
                    <div class="detail">
                        <i class="uil uil-clock"></i>
                        <span>${matchTime}</span>
                    </div>
                </div>
                ${channel ? `
                    <div class="match-channel">
                        <div class="channel-info">
                            <div class="channel-logo">
                                <img src="${channel.image || defaultImage}" 
                                     alt="${channel.name}" 
                                     onerror="this.src='${defaultImage}'">
                            </div>
                            <div>
                                <div class="channel-name">${channel.name}</div>
                                <small class="text-muted">القناة الناقلة</small>
                            </div>
                        </div>
                        <button class="watch-btn" onclick="window.matchApp.openMatch('${match.id}'); event.stopPropagation()">
                            <i class="uil uil-play-circle"></i> مشاهدة
                        </button>
                    </div>
                ` : `
                    <div class="match-channel">
                        <div class="channel-info">
                            <i class="uil uil-tv-retro"></i>
                            <div>
                                <div class="channel-name">قناة غير محددة</div>
                                <small class="text-muted">لا توجد قناة محددة</small>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    // 🔹 الدالة: formatMatchDate
    // 🔹 الوظيفة: تنسيق تاريخ المباراة
    // 🔹 الاستخدام: في createMatchCard
    formatMatchDate(dateString) {
        if (!dateString) return 'غير محدد';
        try {
            const date = new Date(dateString);
            const options = { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                calendar: 'gregory'
            };
            return date.toLocaleDateString('ar-SA', options);
        } catch (error) {
            return 'غير محدد';
        }
    }

    // ============================================
    // 🔹 الجزء 4: دوال الفلترة والبحث
    // ============================================

    // 🔹 الدالة: filterMatchesByDate
    // 🔹 الوظيفة: تصفية المباريات حسب التاريخ
    // 🔹 الاستخدام: في renderMatches
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
                case 'today':
                    return matchDate.getTime() === today.getTime();
                case 'tomorrow':
                    return matchDate.getTime() === tomorrow.getTime();
                case 'week':
                    return matchDate >= today && matchDate <= nextWeek;
                case 'all':
                    return true;
                default:
                    return matchDate.getTime() === today.getTime();
            }
        });
    }

    // 🔹 الدالة: filterMatches
    // 🔹 الوظيفة: تطبيق الفلتر على المباريات
    // 🔹 الاستخدام: عند النقر على زر الفلترة
    filterMatches(filter) {
        this.currentFilter = filter;
        
        // 🔹 تحديث أزرار الفلترة
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.date-btn[onclick="filterMatches('${filter}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // 🔹 إعادة عرض المباريات
        this.renderMatches();
    }

    // ============================================
    // 🔹 الجزء 5: دوال إدارة المباريات
    // ============================================

    // 🔹 الدالة: openMatch
    // 🔹 الوظيفة: فتح المباراة وعرضها
    // 🔹 الاستخدام: عند النقر على مباراة
    openMatch(matchId) {
        const match = this.matchesList.find(m => m.id === matchId);
        if (!match) return;
        
        console.log(`▶️ فتح المباراة: ${match.team1} vs ${match.team2}`);
        
        // 🔹 إذا كانت المباراة ليس لها قناة محددة
        if (!match.channelId) {
            this.showErrorMessage('لم يتم تحديد قناة لهذه المباراة');
            return;
        }
        
        // 🔹 البحث عن القناة
        const channel = this.channelsList.find(c => c.id === match.channelId);
        if (!channel) {
            this.showErrorMessage('القناة الناقلة غير متاحة');
            return;
        }
        
        // 🔹 التحقق من تثبيت التطبيق
        if (!this.hasAppInstalled) {
            this.showInstallModal(channel);
        } else {
            this.openChannel(channel);
        }
    }

    // 🔹 الدالة: showInstallModal
    // 🔹 الوظيفة: عرض نافذة تثبيت التطبيق
    // 🔹 الاستخدام: عند محاولة فتح مباراة بدون تثبيت التطبيق
    showInstallModal(channel) {
        const modal = document.getElementById('installModal');
        if (!modal) return;
        
        const confirmBtn = document.getElementById('confirmInstall');
        const cancelBtn = document.getElementById('cancelInstall');
        
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.installApp(channel);
            };
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        modal.style.display = 'block';
    }

    // 🔹 الدالة: installApp
    // 🔹 الوظيفة: تثبيت التطبيق
    // 🔹 الاستخدام: عند النقر على زر التثبيت
    installApp(channel) {
        console.log('📱 تثبيت التطبيق...');
        
        const modal = document.getElementById('installModal');
        if (modal) modal.style.display = 'none';
        
        // 🔹 فتح رابط تحميل التطبيق
        const appUrl = channel.appUrl || 'https://play.google.com/store/apps/details?id=com.xpola.player';
        window.open(appUrl, '_blank');
        
        // 🔹 تحديث حالة التثبيت
        this.hasAppInstalled = true;
        localStorage.setItem('app_installed', 'true');
        
        // 🔹 فتح القناة بعد ثواني
        setTimeout(() => {
            this.openChannel(channel);
        }, 2000);
    }

    // 🔹 الدالة: openChannel
    // 🔹 الوظيفة: فتح القناة ومشاهدة المباراة
    // 🔹 الاستخدام: بعد تثبيت التطبيق
    openChannel(channel) {
        console.log(`📺 فتح القناة: ${channel.name}`);
        
        if (!channel.url || channel.url === '#') {
            this.showErrorMessage('رابط البث غير متوفر حالياً');
            return;
        }
        
        // 🔹 فتح رابط البث في نافذة جديدة
        window.open(channel.url, '_blank');
        
        // 🔹 تسجيل النشاط
        this.logMatchView(channel);
    }

    // ============================================
    // 🔹 الجزء 6: دوال مساعدة
    // ============================================

    // 🔹 الدالة: setupUserInterface
    // 🔹 الوظيفة: إعداد واجهة المستخدم
    // 🔹 الاستخدام: في initializeApp
    setupUserInterface() {
        // 🔹 إعداد أزرار الفلترة
        window.filterMatches = (filter) => this.filterMatches(filter);
        
        // 🔹 إعداد زر العودة
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        }
    }

    // 🔹 الدالة: addMatchClickListeners
    // 🔹 الوظيفة: إضافة مستمعي الأحداث للمباريات
    // 🔹 الاستخدام: بعد عرض المباريات
    addMatchClickListeners() {
        const matchCards = document.querySelectorAll('.match-card');
        matchCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const matchId = card.getAttribute('data-match-id');
                this.openMatch(matchId);
            });
        });
    }

    // 🔹 الدالة: logMatchView
    // 🔹 الوظيفة: تسجيل مشاهدة المباراة
    // 🔹 الاستخدام: بعد فتح القناة
    logMatchView(channel) {
        try {
            console.log(`📊 تسجيل مشاهدة المباراة على القناة: ${channel.name}`);
            // 🔹 يمكنك إضافة كود لتسجيل المشاهدات هنا
        } catch (error) {
            console.warn('⚠️ فشل تسجيل المشاهدة:', error);
        }
    }

    // 🔹 الدالة: retryLoadData
    // 🔹 الوظيفة: إعادة محاولة تحميل البيانات
    // 🔹 الاستخدام: عند النقر على زر إعادة المحاولة
    async retryLoadData() {
        console.log('🔄 إعادة محاولة تحميل بيانات المباريات...');
        await this.loadAllData();
    }

    // 🔹 الدالة: useLocalData
    // 🔹 الوظيفة: استخدام البيانات المحلية فقط
    // 🔹 الاستخدام: عند النقر على زر استخدام البيانات المحلية
    useLocalData() {
        this.loadDataFromLocalStorage();
    }
}

// ============================================
// 🔹 تهيئة التطبيق عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📂 تهيئة صفحة المباريات...');
    window.matchApp = new MatchApp();
});

// 🔹 جعل الدوال متاحة عالمياً
window.reloadMatchesData = function() {
    if (window.matchApp) {
        window.matchApp.retryLoadData();
    }
};

console.log("✅ تم تحميل matches.js بنجاح");
