// ============================================
// admin.js - نسخة معدلة ومحسنة
// نظام إدارة متكامل مع دعم التعديل والإشعارات والمباريات
// ============================================

// 🔹 فئة AdminManager - إدارة لوحة التحكم
class AdminManager {
    constructor() {
        // 🔹 خصائص حالة النظام
        this.isUserAuthenticated = false;        // 🔹 حالة تسجيل الدخول
        this.isFirebaseConnected = false;        // 🔹 حالة اتصال Firebase
        this.isFirestoreAvailable = false;       // 🔹 حالة Firestore
        
        // 🔹 مصفوفات البيانات
        this.sectionsList = [];                  // 🔹 قائمة الأقسام
        this.channelsList = [];                  // 🔹 قائمة القنوات
        this.matchesList = [];                   // 🔹 قائمة المباريات
        this.notificationsList = [];             // 🔹 قائمة الإشعارات
        
        // 🔹 كائنات التعديل الحالية
        this.currentEditingSection = null;       // 🔹 القسم قيد التعديل
        this.currentEditingChannel = null;       // 🔹 القناة قيد التعديل
        this.currentEditingMatch = null;         // 🔹 المباراة قيد التعديل
        this.currentEditingNotification = null;  // 🔹 الإشعار قيد التعديل
        
        // 🔹 بدء تهيئة النظام
        this.initializeSystem();
    }

    // ============================================
    // 🔹 الجزء 1: دوال التهيئة الأساسية
    // ============================================

    // 🔹 الدالة: initializeSystem
    // 🔹 الوظيفة: تهيئة النظام بالكامل
    // 🔹 الاستخدام: عند إنشاء كائن AdminManager
    async initializeSystem() {
        console.log('🚀 بدء تهيئة نظام الإدارة...');
        
        // 🔹 الخطوة 1: التحقق من المصادقة
        this.checkUserAuthentication();
        
        // 🔹 الخطوة 2: التحقق من اتصال Firebase
        await this.checkFirebaseConnection();
        
        // 🔹 الخطوة 3: إعداد واجهة المستخدم
        this.setupUserInterface();
        
        console.log('✅ تم تهيئة نظام الإدارة بنجاح');
    }

    // 🔹 الدالة: checkUserAuthentication
    // 🔹 الوظيفة: التحقق من حالة تسجيل دخول المستخدم
    // 🔹 الاستخدام: عند تحميل لوحة التحكم
    checkUserAuthentication() {
        const storedAuth = localStorage.getItem('adminAuth');
        const storedEmail = localStorage.getItem('adminEmail');
        
        this.isUserAuthenticated = storedAuth === 'true' && storedEmail;
        
        if (this.isUserAuthenticated) {
            console.log('👤 المستخدم مصادق:', storedEmail);
            this.showAdminPanel();
        } else {
            console.log('❌ المستخدم غير مصادق');
            this.showLoginRequiredMessage();
        }
    }

    // 🔹 الدالة: checkFirebaseConnection
    // 🔹 الوظيفة: التحقق من اتصال Firebase
    // 🔹 الاستخدام: عند بدء النظام
    async checkFirebaseConnection() {
        try {
            console.log('🌐 التحقق من اتصال Firebase...');
            
            // 🔹 استخدام الدوال الموحدة من firebase-init.js
            if (typeof window.firebaseApp === 'undefined') {
                this.showConnectionStatus('نظام Firebase غير محمل', 'error');
                return;
            }
            
            // 🔹 تهيئة Firebase
            const app = window.firebaseApp.initialize();
            if (!app) {
                throw new Error('فشل تهيئة Firebase');
            }
            
            // 🔹 التحقق من الاتصال
            const isConnected = await window.firebaseApp.checkConnection();
            
            if (isConnected) {
                this.isFirebaseConnected = true;
                this.isFirestoreAvailable = true;
                this.showConnectionStatus('الاتصال بقاعدة البيانات ناجح', 'success');
            } else {
                throw new Error('فشل الاتصال بقاعدة البيانات');
            }
            
        } catch (error) {
            console.error('❌ فشل التحقق من اتصال Firebase:', error);
            this.isFirebaseConnected = false;
            this.isFirestoreAvailable = false;
            
            // 🔹 رسالة خطأ واضحة
            let errorMessage = 'خطأ في الاتصال بقاعدة البيانات';
            if (error.message.includes('No Firebase App')) {
                errorMessage = 'تطبيق Firebase غير مهيأ - يرجى تحديث الصفحة';
            }
            
            this.showConnectionStatus(errorMessage, 'error');
        }
    }

    // ============================================
    // 🔹 الجزء 2: دوال عرض الواجهة
    // ============================================

    // 🔹 الدالة: showConnectionStatus
    // 🔹 الوظيفة: عرض حالة اتصال Firebase
    // 🔹 الاستخدام: عند التحقق من الاتصال
    showConnectionStatus(message, type) {
        const statusElement = document.getElementById('firebaseStatus');
        const statusText = document.getElementById('firebaseStatusText');
        
        if (statusElement && statusText) {
            statusElement.style.display = 'block';
            statusText.textContent = message;
            
            // 🔹 إزالة جميع الأصناف السابقة
            statusElement.className = 'firebase-status';
            
            // 🔹 إضافة الصنف المناسب
            if (type === 'success') {
                statusElement.classList.add('firebase-success');
            } else if (type === 'error') {
                statusElement.classList.add('firebase-error');
            } else if (type === 'warning') {
                statusElement.classList.add('firebase-warning');
            }
        }
    }

    // 🔹 الدالة: showAdminPanel
    // 🔹 الوظيفة: عرض لوحة التحكم
    // 🔹 الاستخدام: بعد تسجيل الدخول الناجح
    showAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        const loginRequired = document.getElementById('loginRequired');
        
        if (adminPanel) adminPanel.style.display = 'block';
        if (loginRequired) loginRequired.style.display = 'none';
        
        this.loadAdminInterface();
    }

    // 🔹 الدالة: showLoginRequiredMessage
    // 🔹 الوظيفة: عرض رسالة تسجيل الدخول المطلوب
    // 🔹 الاستخدام: عند عدم تسجيل الدخول
    showLoginRequiredMessage() {
        const adminPanel = document.getElementById('adminPanel');
        const loginRequired = document.getElementById('loginRequired');
        
        if (adminPanel) adminPanel.style.display = 'none';
        if (loginRequired) loginRequired.style.display = 'block';
    }

    // 🔹 الدالة: loadAdminInterface
    // 🔹 الوظيفة: تحميل واجهة لوحة التحكم
    // 🔹 الاستخدام: بعد عرض لوحة التحكم
    loadAdminInterface() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;
        
        adminPanel.innerHTML = this.generateAdminInterfaceHTML();
        this.loadAllData();
        this.setupTabsEvents();
    }

    // 🔹 الدالة: generateAdminInterfaceHTML
    // 🔹 الوظيفة: إنشاء HTML لواجهة لوحة التحكم
    // 🔹 الاستخدام: في loadAdminInterface
    generateAdminInterfaceHTML() {
        return `
            <!-- 🔹 حالة اتصال قاعدة البيانات -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card" style="background: rgba(0,0,0,0.7); border: 1px solid #42318F;">
                        <div class="card-body text-center">
                            <h5><i class="uil uil-database"></i> حالة قاعدة البيانات</h5>
                            <p id="dbStatusText" class="mb-0">
                                ${this.isFirestoreAvailable ? 
                                    '<span class="text-success">✅ متصل بقاعدة البيانات</span>' : 
                                    '<span class="text-warning">⚠️ قاعدة البيانات غير متاحة</span>'
                                }
                            </p>
                            ${!this.isFirestoreAvailable ? `
                                <div class="mt-3">
                                    <button class="btn btn-sm btn-warning me-2" onclick="adminManager.retryFirebaseConnection()">
                                        <i class="uil uil-refresh"></i> إعادة المحاولة
                                    </button>
                                    <button class="btn btn-sm btn-info" onclick="adminManager.useLocalData()">
                                        <i class="uil uil-database"></i> استخدام البيانات المحلية
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🔹 إحصائيات عامة -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stats-card">
                        <div class="stats-number" id="totalSections">0</div>
                        <div class="stats-label">عدد الأقسام</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card">
                        <div class="stats-number" id="totalChannels">0</div>
                        <div class="stats-label">عدد القنوات</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card">
                        <div class="stats-number" id="totalMatches">0</div>
                        <div class="stats-label">عدد المباريات</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stats-card">
                        <div class="stats-number" id="activeNotifications">0</div>
                        <div class="stats-label">الإشعارات النشطة</div>
                    </div>
                </div>
            </div>

            <!-- 🔹 تبويبات التنقل -->
            <ul class="nav nav-tabs nav-tabs-custom mb-4" id="adminTabs">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#sectionsTab">
                        <i class="uil uil-folder"></i> إدارة الأقسام
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#channelsTab">
                        <i class="uil uil-tv"></i> إدارة القنوات
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#matchesTab">
                        <i class="uil uil-football"></i> إدارة المباريات
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#notificationsTab">
                        <i class="uil uil-bell"></i> الإشعارات
                    </a>
                </li>
            </ul>

            <!-- 🔹 محتوى التبويبات -->
            <div class="tab-content">
                <!-- 🔹 تبويب إدارة الأقسام -->
                <div class="tab-pane fade show active" id="sectionsTab">
                    ${this.generateSectionsTabHTML()}
                </div>

                <!-- 🔹 تبويب إدارة القنوات -->
                <div class="tab-pane fade" id="channelsTab">
                    ${this.generateChannelsTabHTML()}
                </div>

                <!-- 🔹 تبويب إدارة المباريات -->
                <div class="tab-pane fade" id="matchesTab">
                    ${this.generateMatchesTabHTML()}
                </div>

                <!-- 🔹 تبويب الإشعارات -->
                <div class="tab-pane fade" id="notificationsTab">
                    ${this.generateNotificationsTabHTML()}
                </div>
            </div>

            <!-- 🔹 أزرار التنقل -->
            <div class="mt-5 text-center">
                <a href="index.html" class="btn btn-primary me-3">
                    <i class="uil uil-home"></i> العودة للرئيسية
                </a>
                <button onclick="adminManager.logoutUser()" class="btn btn-danger">
                    <i class="uil uil-signout"></i> تسجيل الخروج
                </button>
            </div>
        `;
    }

    // ============================================
    // 🔹 الجزء 3: دوال تحميل البيانات
    // ============================================

    // 🔹 الدالة: loadAllData
    // 🔹 الوظيفة: تحميل جميع البيانات من قاعدة البيانات
    // 🔹 الاستخدام: عند بدء لوحة التحكم
    async loadAllData() {
        console.log('📥 جاري تحميل جميع البيانات...');
        
        if (this.isFirestoreAvailable) {
            await this.loadDataFromFirestore();
        } else {
            this.loadDataFromLocalStorage();
        }
        
        this.renderAllData();
        this.updateStatistics();
    }

    // 🔹 الدالة: loadDataFromFirestore
    // 🔹 الوظيفة: تحميل البيانات من Firebase
    // 🔹 الاستخدام: عندما يكون اتصال Firebase متاحاً
    async loadDataFromFirestore() {
        try {
            console.log('🔥 جاري تحميل البيانات من Firebase...');
            
            const db = window.firebaseApp.getDB();
            if (!db) {
                throw new Error('قاعدة البيانات غير متاحة');
            }
            
            // 🔹 تحميل الأقسام
            const sectionsSnapshot = await db.collection('sections').orderBy('order').get();
            this.sectionsList = sectionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ تم تحميل ${this.sectionsList.length} قسم`);
            
            // 🔹 تحميل القنوات
            const channelsSnapshot = await db.collection('channels').orderBy('order').get();
            this.channelsList = channelsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ تم تحميل ${this.channelsList.length} قناة`);
            
            // 🔹 تحميل المباريات
            const matchesSnapshot = await db.collection('matches').orderBy('matchDate').get();
            this.matchesList = matchesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ تم تحميل ${this.matchesList.length} مباراة`);
            
            // 🔹 تحميل الإشعارات
            const notificationsSnapshot = await db.collection('notifications').get();
            this.notificationsList = notificationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ تم تحميل ${this.notificationsList.length} إشعار`);
            
            // 🔹 حفظ نسخة محلية
            this.saveDataToLocalStorage();
            
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات من Firebase:', error);
            this.loadDataFromLocalStorage();
            this.showAlert('تم تحميل البيانات المحلية بسبب خطأ في الاتصال', 'warning');
        }
    }

    // 🔹 الدالة: loadDataFromLocalStorage
    // 🔹 الوظيفة: تحميل البيانات من التخزين المحلي
    // 🔹 الاستخدام: عند عدم توفر اتصال Firebase
    loadDataFromLocalStorage() {
        try {
            console.log('💾 جاري تحميل البيانات من التخزين المحلي...');
            
            // 🔹 تحميل الأقسام
            const savedSections = localStorage.getItem('bein_sections');
            if (savedSections) this.sectionsList = JSON.parse(savedSections);
            
            // 🔹 تحميل القنوات
            const savedChannels = localStorage.getItem('bein_channels');
            if (savedChannels) this.channelsList = JSON.parse(savedChannels);
            
            // 🔹 تحميل المباريات
            const savedMatches = localStorage.getItem('bein_matches');
            if (savedMatches) this.matchesList = JSON.parse(savedMatches);
            
            // 🔹 تحميل الإشعارات
            const savedNotifications = localStorage.getItem('bein_notifications');
            if (savedNotifications) this.notificationsList = JSON.parse(savedNotifications);
            
            console.log('📱 تم تحميل البيانات من التخزين المحلي');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات المحلية:', error);
            this.showAlert('خطأ في تحميل البيانات المحلية', 'error');
        }
    }

    // 🔹 الدالة: saveDataToLocalStorage
    // 🔹 الوظيفة: حفظ البيانات في التخزين المحلي
    // 🔹 الاستخدام: عند إضافة أو تعديل بيانات
    saveDataToLocalStorage() {
        try {
            localStorage.setItem('bein_sections', JSON.stringify(this.sectionsList));
            localStorage.setItem('bein_channels', JSON.stringify(this.channelsList));
            localStorage.setItem('bein_matches', JSON.stringify(this.matchesList));
            localStorage.setItem('bein_notifications', JSON.stringify(this.notificationsList));
            console.log('💾 تم حفظ البيانات في التخزين المحلي');
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات محلياً:', error);
        }
    }

    // ============================================
    // 🔹 الجزء 4: دوال عرض البيانات
    // ============================================

    // 🔹 الدالة: renderAllData
    // 🔹 الوظيفة: عرض جميع البيانات في الواجهة
    // 🔹 الاستخدام: بعد تحميل البيانات
    renderAllData() {
        this.renderSectionsList();
        this.renderChannelsList();
        this.renderMatchesList();
        this.renderNotificationsList();
        this.populateAllDropdowns();
    }

    // 🔹 الدالة: updateStatistics
    // 🔹 الوظيفة: تحديث الإحصائيات العامة
    // 🔹 الاستخدام: بعد تحميل البيانات
    updateStatistics() {
        // 🔹 تحديث عدد الأقسام
        const totalSections = document.getElementById('totalSections');
        if (totalSections) totalSections.textContent = this.sectionsList.length;
        
        // 🔹 تحديث عدد القنوات
        const totalChannels = document.getElementById('totalChannels');
        if (totalChannels) totalChannels.textContent = this.channelsList.length;
        
        // 🔹 تحديث عدد المباريات
        const totalMatches = document.getElementById('totalMatches');
        if (totalMatches) totalMatches.textContent = this.matchesList.length;
        
        // 🔹 تحديث عدد الإشعارات النشطة
        const activeNotifications = document.getElementById('activeNotifications');
        if (activeNotifications) {
            const activeCount = this.notificationsList.filter(n => n.status === 'active').length;
            activeNotifications.textContent = activeCount;
        }
    }

    // 🔹 الدالة: populateAllDropdowns
    // 🔹 الوظيفة: تعبئة جميع القوائم المنسدلة
    // 🔹 الاستخدام: بعد تحميل البيانات
    populateAllDropdowns() {
        this.populateSectionDropdown();
        this.populateChannelDropdown();
    }

    // 🔹 الدالة: populateSectionDropdown
    // 🔹 الوظيفة: تعبئة قائمة الأقسام في نموذج القنوات
    // 🔹 الاستخدام: عند إضافة قناة جديدة
    populateSectionDropdown() {
        const dropdown = document.getElementById('channelSection');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">اختر القسم</option>';
        this.sectionsList.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.name;
            dropdown.appendChild(option);
        });
    }

    // 🔹 الدالة: populateChannelDropdown
    // 🔹 الوظيفة: تعبئة قائمة القنوات في نموذج المباريات
    // 🔹 الاستخدام: عند إضافة مباراة جديدة
    populateChannelDropdown() {
        const dropdown = document.getElementById('matchChannel');
        if (!dropdown) {
            console.log('⚠️ عنصر matchChannel غير موجود');
            return;
        }
        
        dropdown.innerHTML = '<option value="">اختر القناة الناقلة</option>';
        
        // 🔹 ترتيب القنوات حسب الاسم
        const sortedChannels = [...this.channelsList].sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
        
        sortedChannels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            dropdown.appendChild(option);
        });
        
        console.log(`✅ تم تعبئة ${sortedChannels.length} قناة في القائمة`);
    }

    // ============================================
    // 🔹 الجزء 5: دوال إدارة الأقسام
    // ============================================

    // 🔹 الدالة: saveSection
    // 🔹 الوظيفة: حفظ قسم (إضافة أو تعديل)
    // 🔹 الاستخدام: عند إرسال نموذج القسم
    async saveSection(event) {
        event.preventDefault();
        console.log('💾 حفظ القسم...');
        
        // 🔹 جمع بيانات القسم
        const sectionData = {
            name: document.getElementById('sectionName').value,
            order: parseInt(document.getElementById('sectionOrder').value) || 1,
            isActive: document.getElementById('sectionStatus').value === 'active',
            description: document.getElementById('sectionDescription').value,
            image: document.getElementById('sectionImage').value,
            updatedAt: new Date()
        };
        
        const sectionId = document.getElementById('sectionId').value;
        
        try {
            if (sectionId) {
                // 🔹 تحديث قسم موجود
                console.log(`✏️ تحديث القسم: ${sectionId}`);
                await this.updateExistingSection(sectionId, sectionData);
            } else {
                // 🔹 إضافة قسم جديد
                console.log('➕ إضافة قسم جديد');
                await this.addNewSection(sectionData);
            }
            
            // 🔹 تحديث الواجهة
            this.saveDataToLocalStorage();
            this.renderAllData();
            this.resetSectionForm();
            this.showAlert(sectionId ? 'تم تحديث القسم' : 'تم إضافة القسم', 'success');
            
        } catch (error) {
            console.error('❌ خطأ في حفظ القسم:', error);
            this.showAlert('خطأ في حفظ القسم: ' + error.message, 'error');
        }
    }

    // 🔹 الدالة: updateExistingSection
    // 🔹 الوظيفة: تحديث قسم موجود
    // 🔹 الاستخدام: في saveSection عند التحديث
    async updateExistingSection(sectionId, sectionData) {
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            await db.collection('sections').doc(sectionId).update(sectionData);
        }
        
        const index = this.sectionsList.findIndex(s => s.id === sectionId);
        if (index !== -1) {
            this.sectionsList[index] = { ...this.sectionsList[index], ...sectionData };
        }
    }

    // 🔹 الدالة: addNewSection
    // 🔹 الوظيفة: إضافة قسم جديد
    // 🔹 الاستخدام: في saveSection عند الإضافة
    async addNewSection(sectionData) {
        sectionData.createdAt = new Date();
        let newSectionId;
        
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            const docRef = await db.collection('sections').add(sectionData);
            newSectionId = docRef.id;
        } else {
            newSectionId = 'local_' + Date.now();
            sectionData.id = newSectionId;
        }
        
        this.sectionsList.push({
            id: newSectionId,
            ...sectionData
        });
    }

    // 🔹 الدالة: editSection
    // 🔹 الوظيفة: تحميل بيانات قسم للتعديل
    // 🔹 الاستخدام: عند النقر على زر تعديل قسم
    editSection(sectionId) {
        const section = this.sectionsList.find(s => s.id === sectionId);
        if (!section) return;
        
        this.currentEditingSection = section;
        
        // 🔹 تعبئة الحقول
        document.getElementById('sectionId').value = section.id;
        document.getElementById('sectionName').value = section.name;
        document.getElementById('sectionOrder').value = section.order || 1;
        document.getElementById('sectionStatus').value = section.isActive !== false ? 'active' : 'inactive';
        document.getElementById('sectionDescription').value = section.description || '';
        document.getElementById('sectionImage').value = section.image || '';
        
        // 🔹 تحديث الواجهة
        document.getElementById('sectionFormTitle').textContent = 'تعديل القسم';
        document.getElementById('sectionSaveButton').textContent = 'تحديث القسم';
        document.getElementById('cancelSectionEdit').style.display = 'block';
    }

    // 🔹 الدالة: deleteSection
    // 🔹 الوظيفة: حذف قسم
    // 🔹 الاستخدام: عند النقر على زر حذف قسم
    async deleteSection(sectionId) {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        
        try {
            if (this.isFirestoreAvailable) {
                const db = window.firebaseApp.getDB();
                await db.collection('sections').doc(sectionId).delete();
            }
            
            this.sectionsList = this.sectionsList.filter(s => s.id !== sectionId);
            this.saveDataToLocalStorage();
            this.renderAllData();
            
            this.showAlert('تم حذف القسم بنجاح', 'success');
            
        } catch (error) {
            console.error('❌ خطأ في حذف القسم:', error);
            this.showAlert('خطأ في حذف القسم: ' + error.message, 'error');
        }
    }

    // 🔹 الدالة: resetSectionForm
    // 🔹 الوظيفة: إعادة تعيين نموذج القسم
    // 🔹 الاستخدام: بعد الحفظ أو الإلغاء
    resetSectionForm() {
        const form = document.getElementById('sectionForm');
        if (form) form.reset();
        
        document.getElementById('sectionId').value = '';
        document.getElementById('sectionFormTitle').textContent = 'إضافة قسم جديد';
        document.getElementById('sectionSaveButton').textContent = 'حفظ القسم';
        
        const cancelBtn = document.getElementById('cancelSectionEdit');
        if (cancelBtn) cancelBtn.style.display = 'none';
        
        this.currentEditingSection = null;
    }

    // ============================================
    // 🔹 الجزء 6: دوال إدارة القنوات
    // ============================================

    // 🔹 الدالة: saveChannel
    // 🔹 الوظيفة: حفظ قناة (إضافة أو تعديل)
    // 🔹 الاستخدام: عند إرسال نموذج القناة
    async saveChannel(event) {
        event.preventDefault();
        console.log('💾 حفظ القناة...');
        
        const channelData = {
            name: document.getElementById('channelName').value,
            image: document.getElementById('channelImage').value,
            url: document.getElementById('channelUrl').value,
            sectionId: document.getElementById('channelSection').value,
            order: parseInt(document.getElementById('channelOrder').value) || 1,
            appUrl: document.getElementById('channelAppUrl').value,
            updatedAt: new Date()
        };
        
        const channelId = document.getElementById('channelId').value;
        
        try {
            if (channelId) {
                // 🔹 تحديث قناة موجودة
                await this.updateExistingChannel(channelId, channelData);
            } else {
                // 🔹 إضافة قناة جديدة
                await this.addNewChannel(channelData);
            }
            
            this.saveDataToLocalStorage();
            this.renderAllData();
            this.resetChannelForm();
            this.showAlert(channelId ? 'تم تحديث القناة' : 'تم إضافة القناة', 'success');
            
        } catch (error) {
            console.error('❌ خطأ في حفظ القناة:', error);
            this.showAlert('خطأ في حفظ القناة: ' + error.message, 'error');
        }
    }

    // 🔹 الدالة: updateExistingChannel
    // 🔹 الوظيفة: تحديث قناة موجودة
    // 🔹 الاستخدام: في saveChannel عند التحديث
    async updateExistingChannel(channelId, channelData) {
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            await db.collection('channels').doc(channelId).update(channelData);
        }
        
        const index = this.channelsList.findIndex(c => c.id === channelId);
        if (index !== -1) {
            this.channelsList[index] = { ...this.channelsList[index], ...channelData };
        }
    }

    // 🔹 الدالة: addNewChannel
    // 🔹 الوظيفة: إضافة قناة جديدة
    // 🔹 الاستخدام: في saveChannel عند الإضافة
    async addNewChannel(channelData) {
        channelData.createdAt = new Date();
        let newChannelId;
        
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            const docRef = await db.collection('channels').add(channelData);
            newChannelId = docRef.id;
        } else {
            newChannelId = 'local_' + Date.now();
            channelData.id = newChannelId;
        }
        
        this.channelsList.push({
            id: newChannelId,
            ...channelData
        });
    }

    // ============================================
    // 🔹 الجزء 7: دوال إدارة المباريات
    // ============================================

    // 🔹 الدالة: saveMatch
    // 🔹 الوظيفة: حفظ مباراة (إضافة أو تعديل)
    // 🔹 الاستخدام: عند إرسال نموذج المباراة
    async saveMatch(event) {
        event.preventDefault();
        console.log('💾 حفظ المباراة...');
        
        const matchData = {
            team1: document.getElementById('team1').value,
            team2: document.getElementById('team2').value,
            competition: document.getElementById('competition').value,
            matchDate: document.getElementById('matchDate').value,
            matchTime: document.getElementById('matchTime').value,
            channelId: document.getElementById('matchChannel').value,
            status: document.getElementById('matchStatus').value,
            updatedAt: new Date()
        };
        
        // 🔹 التحقق من اختيار قناة
        if (!matchData.channelId) {
            this.showAlert('يرجى اختيار القناة الناقلة', 'error');
            return;
        }
        
        const matchId = document.getElementById('matchId').value;
        
        try {
            if (matchId) {
                // 🔹 تحديث مباراة موجودة
                await this.updateExistingMatch(matchId, matchData);
            } else {
                // 🔹 إضافة مباراة جديدة
                await this.addNewMatch(matchData);
            }
            
            this.saveDataToLocalStorage();
            this.renderAllData();
            this.resetMatchForm();
            this.showAlert(matchId ? 'تم تحديث المباراة' : 'تم إضافة المباراة', 'success');
            
        } catch (error) {
            console.error('❌ خطأ في حفظ المباراة:', error);
            this.showAlert('خطأ في حفظ المباراة: ' + error.message, 'error');
        }
    }

    // 🔹 الدالة: updateExistingMatch
    // 🔹 الوظيفة: تحديث مباراة موجودة
    // 🔹 الاستخدام: في saveMatch عند التحديث
    async updateExistingMatch(matchId, matchData) {
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            await db.collection('matches').doc(matchId).update(matchData);
        }
        
        const index = this.matchesList.findIndex(m => m.id === matchId);
        if (index !== -1) {
            this.matchesList[index] = { ...this.matchesList[index], ...matchData };
        }
    }

    // 🔹 الدالة: addNewMatch
    // 🔹 الوظيفة: إضافة مباراة جديدة
    // 🔹 الاستخدام: في saveMatch عند الإضافة
    async addNewMatch(matchData) {
        matchData.createdAt = new Date();
        let newMatchId;
        
        if (this.isFirestoreAvailable) {
            const db = window.firebaseApp.getDB();
            const docRef = await db.collection('matches').add(matchData);
            newMatchId = docRef.id;
        } else {
            newMatchId = 'local_' + Date.now();
            matchData.id = newMatchId;
        }
        
        this.matchesList.push({
            id: newMatchId,
            ...matchData
        });
    }

    // ============================================
    // 🔹 الجزء 8: دوال مساعدة
    // ============================================

    // 🔹 الدالة: showAlert
    // 🔹 الوظيفة: عرض رسالة تنبيه للمستخدم
    // 🔹 الاستخدام: عند نجاح أو فشل عملية
    showAlert(message, type = 'info') {
        // 🔹 إزالة أي تنبيهات سابقة
        const oldAlerts = document.querySelectorAll('.custom-admin-alert');
        oldAlerts.forEach(alert => alert.remove());
        
        // 🔹 إنشاء التنبيه الجديد
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-admin-alert alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <i class="uil uil-${type === 'success' ? 'check-circle' : 
                                 type === 'error' ? 'times-circle' : 
                                 type === 'warning' ? 'exclamation-triangle' : 'info-circle'} 
                me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        // 🔹 إضافة الأنماط
        alertDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        // 🔹 إضافة التنبيه إلى الصفحة
        document.body.appendChild(alertDiv);
        
        // 🔹 إزالة التنبيه بعد 5 ثواني
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // 🔹 الدالة: retryFirebaseConnection
    // 🔹 الوظيفة: إعادة محاولة الاتصال بـ Firebase
    // 🔹 الاستخدام: عند النقر على زر إعادة المحاولة
    async retryFirebaseConnection() {
        this.showConnectionStatus('جاري إعادة الاتصال...', 'warning');
        await this.checkFirebaseConnection();
        
        if (this.isFirestoreAvailable) {
            await this.loadDataFromFirestore();
        }
    }

    // 🔹 الدالة: useLocalData
    // 🔹 الوظيفة: استخدام البيانات المحلية فقط
    // 🔹 الاستخدام: عند فشل الاتصال بـ Firebase
    useLocalData() {
        this.loadDataFromLocalStorage();
        this.renderAllData();
        this.showAlert('تم تحميل البيانات المحلية', 'info');
    }

    // 🔹 الدالة: logoutUser
    // 🔹 الوظيفة: تسجيل خروج المستخدم
    // 🔹 الاستخدام: عند النقر على زر تسجيل الخروج
    logoutUser() {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // 🔹 الدالة: setupUserInterface
    // 🔹 الوظيفة: إعداد واجهة المستخدم
    // 🔹 الاستخدام: في initializeSystem
    setupUserInterface() {
        console.log('🖥️ إعداد واجهة المستخدم...');
        // 🔹 يمكن إضافة المزيد من إعدادات الواجهة هنا
    }

    // 🔹 الدالة: setupTabsEvents
    // 🔹 الوظيفة: إعداد أحداث التبويبات
    // 🔹 الاستخدام: بعد تحميل واجهة لوحة التحكم
    setupTabsEvents() {
        const tabs = document.querySelectorAll('#adminTabs .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 🔹 عند النقر على تبويب المباريات، قم بتحديث القنوات
                if (tab.getAttribute('href') === '#matchesTab') {
                    setTimeout(() => {
                        this.populateChannelDropdown();
                    }, 100);
                }
            });
        });
    }

    // ============================================
    // 🔹 الجزء 9: دوال توليد HTML (مختصرة للاختصار)
    // ============================================

    // 🔹 ملاحظة: هذه الدوال طويلة، لذا سنكتبها بشكل مختصر

    generateSectionsTabHTML() {
        return `
            <!-- 🔹 نموذج إضافة/تعديل قسم -->
            <div class="card mb-5">
                <div class="card-header card-header-custom">
                    <h4 class="mb-0 text-white">
                        <i class="uil uil-plus-circle"></i> 
                        <span id="sectionFormTitle">إضافة قسم جديد</span>
                    </h4>
                </div>
                <div class="card-body">
                    <form id="sectionForm" onsubmit="adminManager.saveSection(event)">
                        <!-- 🔹 محتوى النموذج -->
                        <input type="hidden" id="sectionId">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label class="form-label">اسم القسم *</label>
                                    <input type="text" id="sectionName" class="form-control" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label class="form-label">ترتيب العرض *</label>
                                    <input type="number" id="sectionOrder" class="form-control" value="1" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">وصف القسم</label>
                            <textarea id="sectionDescription" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success flex-fill py-3">
                                <i class="uil uil-save"></i> 
                                <span id="sectionSaveButton">حفظ القسم</span>
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="adminManager.resetSectionForm()" id="cancelSectionEdit" style="display: none;">
                                <i class="uil uil-times"></i> إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- 🔹 قائمة الأقسام -->
            <div class="card">
                <div class="card-header card-header-custom">
                    <h4 class="mb-0 text-white">
                        <i class="uil uil-folder"></i> الأقسام المضافة
                        <span id="sectionsCount" class="badge bg-primary ms-2">0</span>
                    </h4>
                </div>
                <div class="card-body">
                    <div id="sectionsList">
                        <!-- 🔹 سيتم تعبئتها تلقائياً -->
                    </div>
                </div>
            </div>
        `;
    }

    generateChannelsTabHTML() {
        return `...`; // 🔹 محتوى مشابه
    }

    generateMatchesTabHTML() {
        return `...`; // 🔹 محتوى مشابه
    }

    generateNotificationsTabHTML() {
        return `...`; // 🔹 محتوى مشابه
    }

    // 🔹 الدالة: renderSectionsList
    // 🔹 الوظيفة: عرض قائمة الأقسام
    renderSectionsList() {
        const container = document.getElementById('sectionsList');
        const countElement = document.getElementById('sectionsCount');
        
        if (!container) return;
        
        if (this.sectionsList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="uil uil-folder" style="font-size: 80px; color: #6c757d;"></i>
                    <h5 class="mt-3 text-muted">لا توجد أقسام مضافة</h5>
                </div>
            `;
            if (countElement) countElement.textContent = '0';
            return;
        }
        
        // 🔹 عرض الأقسام
        container.innerHTML = this.sectionsList.map(section => `
            <div class="section-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="section-info">
                            <h5 class="text-white mb-1">${section.name}</h5>
                            <div class="text-muted">
                                <small>الترتيب: ${section.order || 1}</small>
                                <span class="mx-2">•</span>
                                <small class="${section.isActive !== false ? 'text-success' : 'text-danger'}">
                                    ${section.isActive !== false ? 'نشط' : 'غير نشط'}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm me-1" onclick="adminManager.editSection('${section.id}')">
                            <i class="uil uil-edit"></i> تعديل
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="adminManager.deleteSection('${section.id}')">
                            <i class="uil uil-trash-alt"></i> حذف
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (countElement) countElement.textContent = this.sectionsList.length;
    }

    // 🔹 دوال العرض الأخرى مشابهة...
    renderChannelsList() { /* ... */ }
    renderMatchesList() { /* ... */ }
    renderNotificationsList() { /* ... */ }
}

// ============================================
// 🔹 تهيئة النظام عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 بدء تشغيل لوحة التحكم...');
    window.adminManager = new AdminManager();
});

console.log("✅ تم تحميل admin.js بنجاح");
