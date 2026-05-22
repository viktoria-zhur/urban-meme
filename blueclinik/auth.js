// auth.js — ПОЛНАЯ ЛОКАЛЬНАЯ ВЕРСИЯ

const STORAGE_KEY = 'blueclinik_users';
const CURRENT_USER_KEY = 'blueclinik_current_user';
const ADMINS_KEY = 'blueclinik_admins';

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getAdmins() {
    const admins = localStorage.getItem(ADMINS_KEY);
    return admins ? JSON.parse(admins) : [];
}

function saveAdmins(admins) {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function logout() {
    // Очищаем данные текущего пользователя
    localStorage.removeItem(CURRENT_USER_KEY);
    
    // Очищаем сессию (если есть)
    sessionStorage.clear();
    
    // Перенаправляем на главную страницу
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkGuest() {
    const user = getCurrentUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (user.role === 'master') {
            window.location.href = 'master-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    return true;
}

function isAdmin(userId) {
    const admins = getAdmins();
    return admins.includes(userId);
}

function isMaster(user) {
    return user && user.role === 'master';
}

// ========== ИНИЦИАЛИЗАЦИЯ УСЛУГ И РАСПИСАНИЯ ==========

function initMasterServices(masterId) {
    const defaultServices = [
        { name: 'SMAS-лифтинг Ultraformer', price: 50990, duration: 60 },
        { name: 'Биоревитализация REVI', price: 15990, duration: 45 },
        { name: 'RF-лифтинг лица', price: 6900, duration: 30 },
        { name: 'Лазерная шлифовка', price: 14900, duration: 40 },
        { name: 'Консультация косметолога', price: 3990, duration: 30 }
    ];
    
    if (!localStorage.getItem(`services_${masterId}`)) {
        localStorage.setItem(`services_${masterId}`, JSON.stringify(defaultServices));
    }
}

function initMasterSchedule(masterId) {
    const defaultSchedule = {
        monday: { enabled: true, hours: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'] },
        tuesday: { enabled: true, hours: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'] },
        wednesday: { enabled: true, hours: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'] },
        thursday: { enabled: true, hours: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'] },
        friday: { enabled: true, hours: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'] },
        saturday: { enabled: false, hours: [] },
        sunday: { enabled: false, hours: [] }
    };
    
    if (!localStorage.getItem(`schedule_${masterId}`)) {
        localStorage.setItem(`schedule_${masterId}`, JSON.stringify(defaultSchedule));
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ДАННЫХ (АДМИН + МАСТЕРА) ==========

function initLocalData() {
    let users = getUsers();
    let changed = false;
    
    // 1. Создаём администратора (если нет)
    const adminExists = users.find(u => u.email === 'yusupova25@yandex.ru');
    if (!adminExists) {
        console.log('Создаём администратора...');
        const admin = {
            id: 777777,
            fullname: 'Мария Юсупова',
            email: 'yusupova25@yandex.ru',
            phone: '+799999999',
            password: 'qwert12',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(admin);
        changed = true;
        
        // Добавляем в список админов
        let admins = getAdmins();
        if (!admins.includes(777777)) {
            admins.push(777777);
            saveAdmins(admins);
        }
    }
    
    // 2. Создаём мастеров (если нет)
    const mastersList = [
        { id: 777778, fullname: 'Виктория Левченко', email: 'victoria@blueclinik.ru', phone: '+79131234567', password: 'master123', specialization: 'Дерматолог, топ-косметолог' },
        { id: 777779, fullname: 'Яна Плотникова', email: 'yana@blueclinik.ru', phone: '+79139876543', password: 'master123', specialization: 'Косметолог, лазеротерапевт' },
        { id: 777780, fullname: 'Ксения Белоусова', email: 'ksenia@blueclinik.ru', phone: '+79135551234', password: 'master123', specialization: 'Дерматолог, трихолог' },
        { id: 777781, fullname: 'Маргарита Тихонова', email: 'margarita@blueclinik.ru', phone: '+79137778899', password: 'master123', specialization: 'Лазеротерапевт, косметолог' }
    ];
    
    for (const masterData of mastersList) {
        const masterExists = users.find(u => u.email === masterData.email);
        if (!masterExists) {
            console.log(`Создаём мастера: ${masterData.fullname}...`);
            const master = {
                id: masterData.id,
                fullname: masterData.fullname,
                email: masterData.email,
                phone: masterData.phone,
                password: masterData.password,
                role: 'master',
                specialization: masterData.specialization,
                createdAt: new Date().toISOString()
            };
            users.push(master);
            changed = true;
            
            // Создаём услуги и расписание для мастера
            initMasterServices(master.id);
            initMasterSchedule(master.id);
        } else {
            // Проверяем, есть ли услуги и расписание у существующих мастеров
            if (!localStorage.getItem(`services_${masterData.id}`)) {
                initMasterServices(masterData.id);
            }
            if (!localStorage.getItem(`schedule_${masterData.id}`)) {
                initMasterSchedule(masterData.id);
            }
        }
    }
    
    if (changed) {
        saveUsers(users);
        console.log('Данные инициализированы: администратор и мастера созданы');
    }
}

// ========== РЕГИСТРАЦИЯ ==========

function register(fullname, email, phone, password, role = 'client') {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    if (password.length < 6) {
        return { success: false, error: 'Пароль должен быть не менее 6 символов' };
    }
    
    const newUser = {
        id: Date.now(),
        fullname: fullname,
        email: email,
        phone: phone,
        password: password,
        role: role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    saveCurrentUser({
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
        isAdmin: false
    });
    
    return { success: true };
}

// ========== ВХОД ==========

function login(email, password) {
    const users = getUsers();
    let admins = getAdmins();
    
    // Администратор
    const adminEmail = 'yusupova25@yandex.ru';
    const adminPassword = 'qwert12';
    const ADMIN_ID = 777777;
    
    if (email === adminEmail && password === adminPassword) {
        let adminUser = users.find(u => u.email === adminEmail);
        
        if (!adminUser) {
            adminUser = {
                id: ADMIN_ID,
                fullname: 'Мария Юсупова',
                email: adminEmail,
                phone: '+799999999',
                password: adminPassword,
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
            saveUsers(users);
        }
        
        if (!admins.includes(ADMIN_ID)) {
            admins.push(ADMIN_ID);
            saveAdmins(admins);
        }
        
        saveCurrentUser({
            id: ADMIN_ID,
            fullname: adminUser.fullname,
            email: adminEmail,
            phone: adminUser.phone,
            role: 'admin',
            createdAt: adminUser.createdAt,
            isAdmin: true
        });
        
        return { success: true };
    }
    
    // Обычный пользователь или косметолог
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, error: 'Неверный email или пароль' };
    }
    
    saveCurrentUser({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role || 'client',
        specialization: user.specialization || '',
        createdAt: user.createdAt,
        isAdmin: user.role === 'admin'
    });
    
    return { success: true };
}

// ========== ДЛЯ АДМИН-ПАНЕЛИ ==========

function getAllMasters() {
    const users = getUsers();
    return users.filter(u => u.role === 'master');
}

function getAllUsers() {
    return getUsers();
}

function getAllAppointments() {
    const users = getUsers();
    const allAppointments = [];
    
    users.forEach(user => {
        const userAppointments = JSON.parse(localStorage.getItem(`appointments_${user.id}`) || '[]');
        userAppointments.forEach(apt => {
            allAppointments.push({
                ...apt,
                userId: user.id,
                userFullname: user.fullname,
                userEmail: user.email,
                userPhone: user.phone
            });
        });
    });
    
    return allAppointments.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
}

function getMasterServices(masterId) {
    const services = localStorage.getItem(`services_${masterId}`);
    return services ? JSON.parse(services) : [];
}

function getMasterSchedule(masterId) {
    const schedule = localStorage.getItem(`schedule_${masterId}`);
    return schedule ? JSON.parse(schedule) : null;
}

function createMasterByAdmin(fullname, email, phone, password, specialization = '') {
    const currentUser = getCurrentUser();
    const isAdminUser = currentUser && (currentUser.email === 'yusupova25@yandex.ru' || currentUser.isAdmin === true);
    
    if (!isAdminUser) {
        return { success: false, error: 'Доступ запрещен. Только для администратора' };
    }
    
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    if (password.length < 6) {
        return { success: false, error: 'Пароль должен быть не менее 6 символов' };
    }
    
    const newMaster = {
        id: Date.now(),
        fullname: fullname,
        email: email,
        phone: phone,
        password: password,
        role: 'master',
        specialization: specialization,
        createdAt: new Date().toISOString()
    };
    
    users.push(newMaster);
    saveUsers(users);
    
    initMasterServices(newMaster.id);
    initMasterSchedule(newMaster.id);
    
    return { success: true, master: newMaster };
}

function deleteMaster(masterId) {
    const currentUser = getCurrentUser();
    const isAdminUser = currentUser && (currentUser.email === 'yusupova25@yandex.ru' || currentUser.isAdmin === true);
    
    if (!isAdminUser) {
        return { success: false, error: 'Доступ запрещен' };
    }
    
    let users = getUsers();
    const master = users.find(u => u.id === masterId && u.role === 'master');
    
    if (!master) {
        return { success: false, error: 'Мастер не найден' };
    }
    
    users = users.filter(u => u.id !== masterId);
    saveUsers(users);
    
    localStorage.removeItem(`services_${masterId}`);
    localStorage.removeItem(`schedule_${masterId}`);
    
    return { success: true };
}

function deleteUser(userId) {
    const currentUser = getCurrentUser();
    const isAdminUser = currentUser && (currentUser.email === 'yusupova25@yandex.ru' || currentUser.isAdmin === true);
    
    if (!isAdminUser) {
        return { success: false, error: 'Доступ запрещен' };
    }
    
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    
    localStorage.removeItem(`appointments_${userId}`);
    
    return { success: true };
}

function updateUserProfile(userId, fullname, email, phone) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, error: 'Пользователь не найден' };
    }
    
    users[userIndex].fullname = fullname;
    users[userIndex].email = email;
    users[userIndex].phone = phone;
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        saveCurrentUser({
            ...currentUser,
            fullname: fullname,
            email: email,
            phone: phone
        });
    }
    
    return { success: true };
}

// ========== ЗАПУСК ИНИЦИАЛИЗАЦИИ ==========
initLocalData();

// Экспорт для Node.js (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getUsers, saveUsers, getCurrentUser, saveCurrentUser, 
        logout, checkAuth, checkGuest, register, login, 
        getAdmins, saveAdmins, isAdmin, isMaster, getAllMasters,
        createMasterByAdmin, deleteMaster, getAllAppointments, deleteUser,
        getMasterServices, getMasterSchedule, updateUserProfile
    };
}