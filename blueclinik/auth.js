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
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

function isAdmin(userId) {
    const admins = getAdmins();
    return admins.includes(userId);
}

function register(fullname, email, phone, password) {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    if (password.length < 6) {
        return { success: false, error: 'Пароль должен быть не менее 6 символов' };
    }
    
    const newUser = {
        id: Date.now(),
        fullname,
        email,
        phone,
        password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    saveCurrentUser({
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        isAdmin: false
    });
    
    return { success: true };
}

function login(email, password) {
    const users = getUsers();
    let admins = getAdmins();
    
    // Данные админа
    const adminEmail = 'yusupova25@yandex.ru';
    const adminPassword = 'qwert12';
    const adminFullname = 'Мария Юсупова';
    const adminPhone = '+799999999';
    const ADMIN_ID = 777777; // Фиксированный ID для админа
    
    // Если вход с админскими данными
    if (email === adminEmail && password === adminPassword) {
        // Проверяем, есть ли админ в системе
        let adminUser = users.find(u => u.email === adminEmail);
        
        if (!adminUser) {
            // Создаём админа, если его нет
            adminUser = {
                id: ADMIN_ID,
                fullname: adminFullname,
                email: adminEmail,
                phone: adminPhone,
                password: adminPassword,
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
            saveUsers(users);
        }
        
        // Добавляем в список админов
        if (!admins.includes(ADMIN_ID)) {
            admins.push(ADMIN_ID);
            saveAdmins(admins);
        }
        
        // Сохраняем текущего пользователя как админа
        saveCurrentUser({
            id: ADMIN_ID,
            fullname: adminFullname,
            email: adminEmail,
            phone: adminPhone,
            createdAt: adminUser.createdAt || new Date().toISOString(),
            isAdmin: true
        });
        
        return { success: true };
    }
    
    // Обычная проверка для других пользователей
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, error: 'Неверный email или пароль' };
    }
    
    saveCurrentUser({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        isAdmin: isAdmin(user.id)
    });
    
    return { success: true };
}

// Экспорт для Node.js (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        getUsers, saveUsers, getCurrentUser, saveCurrentUser, 
        logout, checkAuth, checkGuest, register, login, 
        getAdmins, saveAdmins, isAdmin,
        STORAGE_KEY, CURRENT_USER_KEY, ADMINS_KEY 
    };
}