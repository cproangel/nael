const items = document.querySelectorAll('.project-item');
const reveal = document.querySelector('.hover-reveal');
const revealImg = document.querySelector('.reveal-img');
const cursor = document.querySelector('.cursor');

const modalOverlay = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');

const productInfo = {
  1: { title: "Бетонный колодец", desc: "Железобетонные кольца для строительства смотровых, водоотводных и канализационных колодцев. Обладают высокой прочностью и абсолютной водонепроницаемостью." },
  2: { title: "Дно колодца (поддон)", desc: "Монолитная железобетонная плита ПН, служащая надежным основанием. Предотвращает проседание конструкции и попадание грунтовых вод снизу." },
  3: { title: "Плита перекрытия", desc: "Специальные плиты перекрытия колодцев и теплотрасс. Гарантируют безопасное закрытие шахты и выдерживают высокие внешние нагрузки." },
  4: { title: "БК (Блок колодезный)", desc: "Блоки колодезные (БК) — это усиленные железобетонные элементы, применяемые для сборки коллекторов и шахт при прокладке подземных коммуникаций." },
  5: { title: "БДО (Опорное кольцо)", desc: "Опорные кольца (БДО) устанавливаются под люки на горловину. Они позволяют точно выровнять уровень чугунного люка с дорожным покрытием." },
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


