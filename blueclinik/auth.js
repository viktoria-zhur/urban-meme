const STORAGE_KEY = 'blueclinik_users';
const CURRENT_USER_KEY = 'blueclinik_current_user';

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
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
        createdAt: newUser.createdAt
    });
    
    return { success: true };
}

function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, error: 'Неверный email или пароль' };
    }
    
    saveCurrentUser({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
    });
    
    return { success: true };
}