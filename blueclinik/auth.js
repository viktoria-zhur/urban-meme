// auth.js — ПОЛНАЯ СЕРВЕРНАЯ ВЕРСИЯ
// Полностью заменяет старый файл

async function apiRequest(endpoint, data) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function register(fullname, email, phone, password, role = 'client') {
    return await apiRequest('register.php', { fullname, email, phone, password, role });
}

async function login(email, password) {
    const result = await apiRequest('login.php', { email, password });
    if (result.success && result.user) {
        saveCurrentUser(result.user);
    }
    return result;
}

function getCurrentUser() {
    const user = localStorage.getItem('blueclinik_current_user');
    return user ? JSON.parse(user) : null;
}

function saveCurrentUser(user) {
    localStorage.setItem('blueclinik_current_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('blueclinik_current_user');
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
        if (user.role === 'admin') window.location.href = 'admin.html';
        else if (user.role === 'master') window.location.href = 'master-dashboard.html';
        else window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

function isAdmin(user) {
    return user && (user.email === 'yusupova25@yandex.ru' || user.isAdmin === true);
}

// API для работы с расписанием и услугами
async function getMasters() {
    return await apiRequest('api_get_masters.php', {});
}

async function getMasterServices(masterId) {
    return await apiRequest('api_get_master_services.php', { masterId });
}

async function getAvailableSlots(masterId, date) {
    return await apiRequest('api_get_available_slots.php', { masterId, date });
}

async function createAppointment(clientId, masterId, serviceName, servicePrice, date, time) {
    return await apiRequest('api_create_appointment.php', { clientId, masterId, serviceName, servicePrice, date, time });
}

// Для админ-панели
async function createMasterByAdmin(fullname, email, phone, password, specialization) {
    return await apiRequest('api_create_master.php', { fullname, email, phone, password, specialization });
}

async function deleteMaster(masterId) {
    return await apiRequest('api_delete_master.php', { masterId });
}

async function getAllMasters() {
    const response = await apiRequest('api_get_masters.php', {});
    return response.masters || [];
}

// Функции для совместимости со старым кодом (если где-то используются)
function getUsers() {
    return [];
}

function saveUsers() {}

function getAdmins() {
    return [];
}

function saveAdmins() {}

// Экспорт для Node.js (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        register, login, getCurrentUser, saveCurrentUser, logout, 
        checkAuth, checkGuest, isAdmin, getMasters, getMasterServices,
        getAvailableSlots, createAppointment, createMasterByAdmin, deleteMaster, getAllMasters
    };
}