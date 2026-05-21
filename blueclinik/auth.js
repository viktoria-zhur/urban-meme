const STORAGE_KEY = 'blueclinik_users';
const CURRENT_USER_KEY = 'blueclinik_current_user';
const ADMINS_KEY = 'blueclinik_admins';

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
    localStorage.removeItem(CURRENT_USER_KEY);
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

// Регистрация ТОЛЬКО для клиентов
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
        role: 'client',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    saveCurrentUser({
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        role: 'client',
        createdAt: newUser.createdAt,
        isAdmin: false
    });
    
    return { success: true };
}

// Создание мастера (только для админа)
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
    
    // Дефолтные услуги
    const defaultServices = [
        { name: 'SMAS-лифтинг', price: 50990, duration: 60 },
        { name: 'Биоревитализация REVI', price: 15990, duration: 45 },
        { name: 'RF-лифтинг лица', price: 6900, duration: 30 }
    ];
    localStorage.setItem(`services_${newMaster.id}`, JSON.stringify(defaultServices));
    
    // Дефолтное расписание
    const defaultSchedule = {
        monday: { enabled: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
        tuesday: { enabled: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
        wednesday: { enabled: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
        thursday: { enabled: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
        friday: { enabled: true, hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
        saturday: { enabled: false, hours: [] },
        sunday: { enabled: false, hours: [] }
    };
    localStorage.setItem(`schedule_${newMaster.id}`, JSON.stringify(defaultSchedule));
    
    return { success: true, master: newMaster };
}

// Получить всех мастеров
function getAllMasters() {
    const users = getUsers();
    return users.filter(u => u.role === 'master');
}

// Удалить мастера
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

// Вход в систему
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
    
    // Сохраняем пользователя с его ролью
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

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getUsers, saveUsers, getCurrentUser, saveCurrentUser, 
        logout, checkAuth, checkGuest, register, login, 
        getAdmins, saveAdmins, isAdmin, isMaster, getAllMasters, 
        createMasterByAdmin, deleteMaster
    };
}