const items = document.querySelectorAll('.project-item');
const reveal = document.querySelector('.hover-reveal');
const revealImg = document.querySelector('.reveal-img');
const cursor = document.querySelector('.cursor');
const heroSection = document.querySelector('.heroEffects');
const heroBg = heroSection ? heroSection.querySelector('.bg') : null;
const heroShade = heroSection ? heroSection.querySelector('.shade') : null;
const heroContent = heroSection ? heroSection.querySelector('.hero-content') : null;
const heroArrow = heroSection ? heroSection.querySelector('.arrow') : null;
const catalogSection = document.getElementById('catalog');

function initHeroScrollEffect() {
    if (!heroSection || !heroBg || !heroShade || !heroContent) return;

    let rafId = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyState = () => {
        const heroHeight = Math.max(heroSection.offsetHeight, window.innerHeight);
        const heroTop = heroSection.getBoundingClientRect().top;
        const travelled = Math.min(Math.max(-heroTop, 0), heroHeight);
        const progress = travelled / heroHeight;
        const shadeOpacity = Math.min(0.84, 0.66 + progress * 0.18);

        heroBg.style.transform = `translate3d(0, ${progress * 70}px, 0) scale(${1 + progress * 0.28})`;
        heroBg.style.opacity = String(Math.max(0, 1 - progress * 1.35));
        heroShade.style.opacity = String(shadeOpacity);
        heroContent.style.transform = `translate3d(0, ${progress * -90}px, 0)`;
        heroContent.style.opacity = String(Math.max(0, 1 - progress * 1.1));

        if (heroArrow) {
            heroArrow.style.opacity = String(Math.max(0, 1 - progress * 2.2));
            heroArrow.style.pointerEvents = progress > 0.45 ? 'none' : 'auto';
        }
    };

    const scheduleApplyState = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            applyState();
        });
    };

    if (!prefersReducedMotion) {
        window.addEventListener('scroll', scheduleApplyState, { passive: true });
        window.addEventListener('resize', scheduleApplyState);
        scheduleApplyState();
    } else {
        heroShade.style.opacity = '0.66';
    }
}

initHeroScrollEffect();

if (heroArrow && catalogSection) {
    heroArrow.addEventListener('click', () => {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// Preloader and Image Preloading
const preloader = document.querySelector('.preloader');
const preloaderProgress = document.querySelector('.loader-progress');
const preloaderText = document.querySelector('.loader-text');

let loadedImagesCount = 0;
let totalImagesToLoad = 0;
const preloadedImages = []; // Cache to store Image objects to prevent GC

// Count how many images we actually need to load, and inject mobile images
items.forEach(item => {
    const imgUrl = item.getAttribute('data-img');
    if (imgUrl) {
        totalImagesToLoad++;
        
        // Inject mobile image
        const mobileImg = document.createElement('img');
        mobileImg.src = imgUrl;
        mobileImg.className = 'mobile-img';
        mobileImg.alt = 'Preview';
        item.appendChild(mobileImg);
    }
});

if (totalImagesToLoad > 0) {
    items.forEach(item => {
        const imgUrl = item.getAttribute('data-img');
        if (imgUrl) {
            const img = new Image();
            
            // On load or error, update progress
            img.onload = img.onerror = () => {
                loadedImagesCount++;
                const percentage = Math.floor((loadedImagesCount / totalImagesToLoad) * 100);
                if(preloaderProgress) preloaderProgress.style.width = percentage + '%';
                if(preloaderText) preloaderText.textContent = `Loading... ${percentage}%`;
                
                if (loadedImagesCount === totalImagesToLoad) {
                    // All images loaded
                    setTimeout(() => {
                        if(preloader) preloader.classList.add('hidden');
                    }, 500); // 500ms delay to smoothly finish bar
                }
            };
            
            img.src = imgUrl; // Start loading
            preloadedImages.push(img);
        }
    });
} else {
    // No images to load
    if(preloader) preloader.classList.add('hidden');
}

const modalOverlay = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');

const productInfo = {
  1: { title: "Бетонный колодец", desc: "Железобетонные кольца для строительства смотровых, водоотводных и канализационных колодцев. Обладают высокой прочностью и абсолютной водонепроницаемостью." },
  2: { title: "Дно колодца (поддон)", desc: "Монолитная железобетонная плита ПН, служащая надежным основанием. Предотвращает проседание конструкции и попадание грунтовых вод снизу." },
  3: { title: "Плита перекрытия", desc: "Специальные плиты перекрытия колодцев и теплотрасс. Гарантируют безопасное закрытие шахты и выдерживают высокие внешние нагрузки." },
  4: { title: "БК (Блок колодезный)", desc: "Блоки колодезные (БК) — это усиленные железобетонные элементы, применяемые для сборки коллекторов и шахт при прокладке подземных коммуникаций." },
  5: { title: "БДО (Блок дорожного ограждения)", desc: "Блоки дорожного ограждения (БДО) предназначены для обеспечения безопасности дорожного движения. Они используются для разделения транспортных потоков и ограждения опасных участков." },
  6: { title: "ПТМ (Плиты многопустотные)", desc: "Плиты перекрытия с продольными пустотами. Существенно снижают вес здания и нагрузку на фундамент, сохраняя при этом превосходную прочность." },
  7: { title: "Свая забивная", desc: "Сплошные железобетонные стержни, предназначенные для передачи колоссальных нагрузок от здания на глубокие и плотные слои грунта." },
  8: { title: "ФБС (Блоки фундаментные)", desc: "Фундаментные блоки сплошные (ФБС) применяются для устройства ленточных фундаментов и стен подвалов. Отличаются высокой сейсмостойкостью." },
  9: { title: "УБКМ (Лотки)", desc: "Специализированные лотки для безопасной прокладки силовых кабелей под землей, обеспечивая их защиту от механических повреждений и влаги." },
  10: { title: "Плита дорожная", desc: "Высокопрочные дорожные плиты, выдерживающие движение тяжелой строительной спецтехники. Идеальны для обустройства надежных временных дорог." },
  11: { title: "Труба безнапорная", desc: "Железобетонные трубы высокой пропускной способности. Предназначены для водопропускных систем под дорогами и транспортировки жидкостей." }
};

// QuickTo allows highly performant following animations
const cursorX = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3.out"});
const cursorY = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3.out"});

const revealX = gsap.quickTo(reveal, "x", {duration: 0.5, ease: "power3.out"});
const revealY = gsap.quickTo(reveal, "y", {duration: 0.5, ease: "power3.out"});

let isRevealActive = false;

// Follow mouse movement
window.addEventListener('mousemove', (e) => {
  cursorX(e.clientX);
  cursorY(e.clientY);
  revealX(e.clientX);
  revealY(e.clientY);

  // Joskiy fix: hide reveal if cursor is outside project items
  if (!e.target.closest('.project-item') && isRevealActive) {
    isRevealActive = false;
    gsap.to(reveal, { opacity: 0, scale: 0.8, duration: 0.3, overwrite: "auto" });
    gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: "auto" });
  }
});

// Logic for Hover Reveal and Modal Clicks
items.forEach((item, index) => {
  item.addEventListener('mouseenter', () => {
    // Prevent hover animations if modal is active
    if (modalOverlay.classList.contains('is-open')) return;

    isRevealActive = true;
    const imgUrl = item.getAttribute('data-img');
    
    if (imgUrl) {
      revealImg.src = imgUrl;
      
      gsap.to(reveal, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto"
      });
      
      gsap.fromTo(revealImg,
        { scale: 1.4 },
        { scale: 1, duration: 0.4 }
      );
    }
    
    gsap.to(cursor, {
      scale: 4,
      duration: 0.2,
      overwrite: "auto"
    });
  });
  
  item.addEventListener('mouseleave', () => {
    isRevealActive = false;
    gsap.to(reveal, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });
    
    gsap.to(cursor, {
      scale: 1,
      duration: 0.2,
      overwrite: "auto"
    });
  });

  // Modal Interaction
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = index + 1;
    if (productInfo[id]) {
      modalTitle.textContent = productInfo[id].title;
      modalDesc.textContent = productInfo[id].desc;
      
      const openBtn = document.getElementById('modal-open');
      if(openBtn) openBtn.click();

      // Abruptly hide hover effects when modal opens
      gsap.to(reveal, { opacity: 0, scale: 0.8, duration: 0.1 });
      gsap.to(cursor, { scale: 1, duration: 0.1 });
    }
  });
});

// --- Telegram Form Logic ---
const tgForm = document.getElementById('tg-form');
const formMsg = document.getElementById('form-msg');

if (tgForm) {
    // Вставьте сюда токен вашего бота и ваш chat id
    // Получить токен бота: https://t.me/BotFather
    // Получить свой chat_id: https://t.me/userinfobot
    const botToken = '8639021980:AAH3RycmuTUgvZUBm4yAU4oRHEgSbC-lbJ0'; 
    const chatId = '559066508'; 

    tgForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phoneInput = document.getElementById('client-phone').value;
        const submitBtn = document.getElementById('submit-btn');
        
        if (botToken === 'YOUR_BOT_TOKEN_HERE') {
            formMsg.textContent = 'Для работы формы нужно вставить токен бота в script.js';
            formMsg.className = 'msg-error';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        formMsg.textContent = 'Отправка...';
        formMsg.className = 'msg-success';

        const text = `Новая заявка на звонок с сайта (DURABLE ЖБИ)!\n\nТелефон: ${phoneInput}`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                formMsg.textContent = 'Заявка успешно отправлена! Мы скоро перезвоним.';
                formMsg.className = 'msg-success';
                tgForm.reset();
            } else {
                throw new Error(data.description || 'Ошибка отправки');
            }
        })
        .catch(err => {
            console.error(err);
            formMsg.textContent = 'Произошла ошибка. Пожалуйста, позвоните нам.';
            formMsg.className = 'msg-error';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            setTimeout(() => { formMsg.textContent = ''; }, 5000);
        });
    });
}
// --- Typed.js Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.typed-word')) {
        new Typed('.typed-word', {
            strings: ['качество', 'доверие', 'решение', 'будущее'],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2800,
            loop: true,
            cursorChar: '|'
        });
    }
});
