/**
 * BlueClinik - Main JavaScript
 * Функционал: модальные окна, слайдеры, формы, куки, навигация
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== МОДАЛЬНЫЕ ОКНА =====
    const modals = {
        consultation: document.getElementById('consultationModal'),
        certificate: document.getElementById('certificateModal'),
        success: document.getElementById('successModal')
    };
    
    const openModalButtons = document.querySelectorAll('[data-modal]');
    const closeModalButtons = document.querySelectorAll('.modal__close, .modal__overlay');
    
    function openModal(modalName) {
        if (modals[modalName]) {
            modals[modalName].classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Открытие модальных окон
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalName = btn.dataset.modal;
            openModal(modalName);
        });
    });
    
    // Закрытие модальных окон
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal);
        });
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Object.values(modals).forEach(modal => {
                if (modal?.classList.contains('active')) {
                    closeModal(modal);
                }
            });
        }
    });
    
    // ===== ФОРМЫ =====
    const forms = document.querySelectorAll('form[data-form]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Сбор данных формы
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Валидация телефона (простая)
            const phone = data.phone?.replace(/\D/g, '');
            if (phone && phone.length < 10) {
                alert('Пожалуйста, введите корректный номер телефона');
                return;
            }
            
            // Имитация отправки
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            try {
                // Здесь будет реальный fetch к вашему API
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Показать успешное модальное окно
                closeModal(modals.consultation);
                closeModal(modals.certificate);
                openModal('success');
                
                // Сброс формы
                form.reset();
            } catch (error) {
                console.error('Ошибка отправки:', error);
                alert('Произошла ошибка. Попробуйте ещё раз.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    });
    
    // ===== РАСКРЫТИЕ ЦЕН =====
    const priceToggles = document.querySelectorAll('.price-table__toggle');
    
    priceToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.toggle;
            const hiddenSection = document.getElementById(targetId);
            if (hiddenSection) {
                hiddenSection.classList.toggle('show');
                btn.textContent = hiddenSection.classList.contains('show') 
                    ? 'Скрыть цены' 
                    : 'Раскрыть цены';
            }
        });
    });
    
    // ===== СЛАЙДЕРЫ (простая реализация) =====
    function initSlider(trackSelector, prevBtn, nextBtn) {
        const track = document.querySelector(trackSelector);
        if (!track) return;
        
        const items = track.children;
        const itemWidth = items[0]?.offsetWidth + 24; // ширина + gap
        let currentIndex = 0;
        
        function updateSlider() {
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }
        
        document.querySelector(prevBtn)?.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
        
        document.querySelector(nextBtn)?.addEventListener('click', () => {
            if (currentIndex < items.length - 2) {
                currentIndex++;
                updateSlider();
            }
        });
        
        // Адаптация при изменении размера
        window.addEventListener('resize', updateSlider);
    }
    
    initSlider('#gallerySlider .gallery__track', '#galleryPrev', '#galleryNext');
    initSlider('#reviewsSlider .reviews__track', '#reviewsPrev', '#reviewsNext');
    
    // ===== МОБИЛЬНОЕ МЕНЮ =====
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileMenuClose');
    
    burger?.addEventListener('click', () => {
        mobileMenu?.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    mobileClose?.addEventListener('click', () => {
        mobileMenu?.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Закрытие меню при клике на ссылку
    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // ===== HEADER SCROLL EFFECT =====
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    });
    
    // ===== COOKIE BANNER =====
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookies = document.getElementById('acceptCookies');
    
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => {
            cookieBanner?.classList.add('active');
        }, 2000);
    }
    
    acceptCookies?.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner?.classList.remove('active');
    });
    
    // ===== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = header?.offsetHeight || 80;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Наблюдать за карточками
    document.querySelectorAll('.offer-card, .service-card, .specialist-card, .benefit-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
    
});