const items = document.querySelectorAll('.project-item');
const reveal = document.querySelector('.hover-reveal');
const revealImg = document.querySelector('.reveal-img');
const cursor = document.querySelector('.cursor');
const heroSection = document.querySelector('.heroEffects');
const heroBg = heroSection ? heroSection.querySelector('.bg') : null;
const heroBeamsCanvas = heroBg ? heroBg.querySelector('.hero-beams-canvas') : null;
const heroShade = heroSection ? heroSection.querySelector('.shade') : null;
const heroContent = heroSection ? heroSection.querySelector('.hero-content') : null;
const heroArrow = heroSection ? heroSection.querySelector('.arrow') : null;
const catalogSection = document.getElementById('catalog');
const preloader = document.querySelector('.preloader');
const preloaderProgress = document.querySelector('.loader-progress');
const preloaderText = document.querySelector('.loader-text');

let totalAssetsToLoad = heroBeamsCanvas ? 1 : 0;
let loadedAssetsCount = 0;
const completedPreloadAssets = new Set();

function updatePreloaderProgress() {
    if (totalAssetsToLoad <= 0) {
        if (preloaderProgress) preloaderProgress.style.width = '100%';
        if (preloaderText) preloaderText.textContent = 'Loading... 100%';
        return;
    }

    const percentage = Math.floor((loadedAssetsCount / totalAssetsToLoad) * 100);
    if (preloaderProgress) preloaderProgress.style.width = `${percentage}%`;
    if (preloaderText) preloaderText.textContent = `Loading... ${percentage}%`;
}

function completePreloadAsset(key) {
    if (completedPreloadAssets.has(key)) return;
    completedPreloadAssets.add(key);
    loadedAssetsCount += 1;
    updatePreloaderProgress();

    if (loadedAssetsCount >= totalAssetsToLoad) {
        setTimeout(() => {
            if (preloader) preloader.classList.add('hidden');
        }, 500);
    }
}

function initHeroBeamBackground() {
    if (!heroBg || !heroBeamsCanvas) {
        completePreloadAsset('shader');
        return;
    }

    const gl = heroBeamsCanvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false
    });
    if (!gl) {
        completePreloadAsset('shader');
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const maxDpr = 2;
    let width = 0;
    let height = 0;
    let animationFrameId = null;
    let startTime = 0;
    let shaderReadyReported = false;

    const vertexShaderSource = `
        attribute vec2 aPosition;

        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision highp float;

        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u * u * (3.0 - 2.0 * u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        vec4 tanhApprox(vec4 x) {
          vec4 e2 = exp(2.0 * x);
          return (e2 - 1.0) / (e2 + 1.0);
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 35.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5 + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
            vec4 auroraColors = vec4(
              0.1 + 0.3 * sin(i * 0.2 + iTime * 0.4),
              0.3 + 0.5 * cos(i * 0.3 + iTime * 0.5),
              0.7 + 0.3 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.8)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanhApprox(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
    `;

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        if (!shader) {
            completePreloadAsset('shader');
            return null;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Hero shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            completePreloadAsset('shader');
            return null;
        }

        return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
        completePreloadAsset('shader');
        return;
    }

    const program = gl.createProgram();
    if (!program) {
        completePreloadAsset('shader');
        return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Hero shader link error:', gl.getProgramInfoLog(program));
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteProgram(program);
        completePreloadAsset('shader');
        return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        completePreloadAsset('shader');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]),
        gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        width = window.innerWidth;
        height = window.innerHeight;

        heroBeamsCanvas.width = Math.round(width * dpr);
        heroBeamsCanvas.height = Math.round(height * dpr);
        heroBeamsCanvas.style.width = `${width}px`;
        heroBeamsCanvas.style.height = `${height}px`;
        gl.viewport(0, 0, heroBeamsCanvas.width, heroBeamsCanvas.height);
        if (resolutionLocation) {
            gl.uniform2f(resolutionLocation, heroBeamsCanvas.width, heroBeamsCanvas.height);
        }
    }

    function render(now, singleFrame) {
        if (!startTime) startTime = now;
        const time = prefersReducedMotion ? 0 : (now - startTime) * 0.001;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (timeLocation) {
            gl.uniform1f(timeLocation, time);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (!shaderReadyReported) {
            shaderReadyReported = true;
            completePreloadAsset('shader');
        }

        if (!singleFrame && !prefersReducedMotion) {
            animationFrameId = window.requestAnimationFrame((nextNow) => render(nextNow, false));
        }
    }

    function handleResize() {
        if (animationFrameId !== null) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        resizeCanvas();

        if (!prefersReducedMotion) {
            animationFrameId = window.requestAnimationFrame((nextNow) => render(nextNow, false));
        } else {
            render(performance.now(), true);
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize();
}

function initHeroScrollEffect() {
    if (!heroSection || !heroBg || !heroShade || !heroContent) return;

    let rafId = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyState = () => {
        const heroHeight = Math.max(heroSection.offsetHeight, window.innerHeight);
        const heroTop = heroSection.getBoundingClientRect().top;
        const travelled = Math.min(Math.max(-heroTop, 0), heroHeight);
        const progress = travelled / heroHeight;
        const shadeOpacity = Math.min(0.58, 0.34 + progress * 0.24);

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
        heroShade.style.opacity = '0.34';
    }
}

initHeroScrollEffect();

if (heroArrow && catalogSection) {
    heroArrow.addEventListener('click', () => {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

const preloadedImages = []; // Cache to store Image objects to prevent GC

// Count how many images we actually need to load, and inject mobile images
items.forEach(item => {
    const imgUrl = item.getAttribute('data-img');
    if (imgUrl) {
        totalAssetsToLoad++;
        
        // Inject mobile image
        const mobileImg = document.createElement('img');
        mobileImg.src = imgUrl;
        mobileImg.className = 'mobile-img';
        mobileImg.alt = 'Preview';
        item.appendChild(mobileImg);
    }
});

updatePreloaderProgress();
initHeroBeamBackground();

if (items.length > 0) {
    items.forEach(item => {
        const imgUrl = item.getAttribute('data-img');
        if (imgUrl) {
            const img = new Image();
            
            // On load or error, update progress
            img.onload = img.onerror = () => {
                completePreloadAsset(`img:${imgUrl}`);
            };
            
            img.src = imgUrl; // Start loading
            preloadedImages.push(img);
        }
    });
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
