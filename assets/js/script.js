  (function(){
    var stage = document.getElementById('stage');
    var sheen = document.getElementById('sheen');
    var hero = document.getElementById('hero');
    var roomImg = document.getElementById('roomImg');
    var loader = document.getElementById('loader');
    var loaderFill = document.getElementById('loaderFill');

    /* ---- Loader ---- */
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ loaderFill.style.width = '100%'; });
    });

    var imgReady = new Promise(function(resolve){
      if (roomImg.complete && roomImg.naturalWidth) resolve();
      else roomImg.addEventListener('load', resolve, { once:true });
    });
    var minTime = new Promise(function(resolve){ setTimeout(resolve, 1700); });

    Promise.all([imgReady, minTime]).then(function(){
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
      positionHotspots();
      setTimeout(function(){ loader.style.display = 'none'; }, 750);
    });

    /* ---- Hotspot positioning (maps original image px -> rendered box, matching object-fit:cover) ---- */
    var NAT_W = 2752, NAT_H = 1536;
    var OBJ_POS_X = 0.58, OBJ_POS_Y = 0.62;
    var REGIONS = {
      lockers: [1540, 240, 2752, 1260],
      laptop:  [815, 715, 1150, 925]
    };

    function positionHotspots(){
      var cw = stage.clientWidth, ch = stage.clientHeight;
      if (!cw || !ch) return;
      var scale = Math.max(cw / NAT_W, ch / NAT_H);
      var renderedW = NAT_W * scale, renderedH = NAT_H * scale;
      var tx = (cw - renderedW) * OBJ_POS_X;
      var ty = (ch - renderedH) * OBJ_POS_Y;

      Object.keys(REGIONS).forEach(function(key){
        var el = document.getElementById('hotspot-' + key);
        if (!el) return;
        var r = REGIONS[key];
        el.style.left   = (r[0] * scale + tx) + 'px';
        el.style.top    = (r[1] * scale + ty) + 'px';
        el.style.width  = ((r[2]-r[0]) * scale) + 'px';
        el.style.height = ((r[3]-r[1]) * scale) + 'px';
      });
    }

    window.addEventListener('resize', positionHotspots);
    positionHotspots();

    var targetX = 0, targetY = 0; // -1 to 1
    var curX = 0, curY = 0;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onMove(e){
      var rect = hero.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;   // 0..1
      var py = (e.clientY - rect.top) / rect.height;   // 0..1
      targetX = (px - 0.5) * 2; // -1..1
      targetY = (py - 0.5) * 2;
    }

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', function(){ targetX = 0; targetY = 0; });

    // gentle gyroscope support for mobile "look around"
    window.addEventListener('deviceorientation', function(e){
      if (e.gamma === null || e.beta === null) return;
      targetX = Math.max(-1, Math.min(1, e.gamma / 30));
      targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    });

    function tick(){
      if (!reduceMotion){
        curX += (targetX - curX) * 0.055;
        curY += (targetY - curY) * 0.055;

        var rotateY = curX * 7;      // look left/right
        var rotateX = -curY * 5;     // look up/down
        var panX = curX * -18;
        var panY = curY * -12;
        var scale = 1.08;

        stage.style.transform =
          'perspective(1200px) translate3d(' + panX + 'px,' + panY + 'px,0) ' +
          'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(' + scale + ')';

        sheen.style.transform =
          'translate3d(' + (curX * 40) + 'px,' + (curY * 30) + 'px,0) rotate(' + (curX * 4) + 'deg)';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---- Locker Room modal + Locker Reveal (shared flow) ---- */
  (function(){

    /* --- Locker Room (level 1) --- */
    var lrModal   = document.getElementById('lrModal');
    var lrBackdrop = document.getElementById('lrBackdrop');
    var lrClose   = document.getElementById('lrClose');
    var ctaBtn    = document.getElementById('openLockersCta');
    var navLink   = document.getElementById('navCollectionLink');

    function openLR(e){
      if (e) e.preventDefault();
      lrModal.classList.add('is-open');
      lrModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lrClose.focus();
    }

    function closeLR(){
      lrModal.classList.remove('is-open');
      lrModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (ctaBtn) ctaBtn.addEventListener('click', openLR);
    if (navLink) navLink.addEventListener('click', openLR);
    lrBackdrop.addEventListener('click', closeLR);
    lrClose.addEventListener('click', closeLR);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && lrModal.classList.contains('is-open') && !reveal.classList.contains('is-active')) closeLR();
    });

    /* --- Locker Reveal (level 2) --- */
    var reveal    = document.getElementById('lockerReveal');
    var doorCover = document.getElementById('revealDoorCover');
    var revealClose = document.getElementById('revealClose');
    var revealBackdrop = document.getElementById('revealBackdrop');
    var photoEl   = document.getElementById('revealPhoto');
    var captionEl = document.getElementById('revealCaption');
    var cardsContainer = document.getElementById('revealCardsContainer');

    /* single global drag state — avoids accumulating listeners per card */
    var dragState = null;
    document.addEventListener('mousemove', function(e){
      if (!dragState) return;
      dragState.card.style.left = (e.clientX - dragState.ox) + 'px';
      dragState.card.style.top  = (e.clientY - dragState.oy) + 'px';
    });
    document.addEventListener('mouseup', function(){
      if (!dragState) return;
      dragState.card.style.cursor = 'grab';
      dragState.card.style.zIndex = '30';
      dragState = null;
    });
    document.addEventListener('touchmove', function(e){
      if (!dragState) return;
      e.preventDefault();
      var t = e.touches[0];
      dragState.card.style.left = (t.clientX - dragState.ox) + 'px';
      dragState.card.style.top  = (t.clientY - dragState.oy) + 'px';
    }, { passive: false });
    document.addEventListener('touchend', function(){
      if (!dragState) return;
      dragState.card.style.cursor = 'grab';
      dragState.card.style.zIndex = '30';
      dragState = null;
    });

    var CARD_LABELS = {
      'LOCKER — 01': ['TEE 01','TEE 02','PRINT','GRAPHIC','COTTON','BOLD','DROP','ARC'],
      'LOCKER — 02': ['SHIRT 01','SHIRT 02','BUTTON','WOVEN','STUDIO','CUT','ARCH','FIT'],
      'LOCKER — 03': ['HOOD 01','HOOD 02','FLEECE','PULL','WARM','CLEAN','STAPLE','DRIP'],
    };

    var CAPTIONS = {
      'LOCKER — 01': { title: 'Heavy Cotton. Bold Graphics.', sub: 'The original medium — every drop, every print.' },
      'LOCKER — 02': { title: 'Button Up. Stand Out.', sub: 'Woven roots, clean cut — built for the studio.' },
      'LOCKER — 03': { title: 'Stay Warm. Stay Clean.', sub: 'Pull it over. The studio staple, worn in.' },
    };

    function openReveal(btn){
      /* hide locker room, show reveal */
      lrModal.classList.remove('is-open');
      lrModal.setAttribute('aria-hidden', 'true');

      if (photoEl && btn.dataset.img) photoEl.src = btn.dataset.img;
      var cap = CAPTIONS[btn.dataset.kicker] || {};
      if (captionEl) captionEl.innerHTML = (cap.title || '') + (cap.sub ? '<span>' + cap.sub + '</span>' : '');

      doorCover.style.transition = 'none';
      doorCover.style.transform = 'rotateY(0deg)';
      void doorCover.offsetWidth;
      doorCover.style.transition = '';
      doorCover.style.transform = '';

      if (cardsContainer) {
        cardsContainer.innerHTML = '';
        var labels    = (CARD_LABELS[btn.dataset.kicker] || []);
        var delays    = [340,370,400,430,460,410,380,350];
        var durations = [750,700,730,710,760,720,680,740];
        labels.forEach(function(lbl, i) {
          var card = document.createElement('div');
          card.className = 'reveal-card';
          card.setAttribute('data-label', lbl);
          card.style.cssText = 'top:45%;left:35%;animation:cardFly'+(i+1)+' '+durations[i]+'ms cubic-bezier(.22,.85,.28,1) '+delays[i]+'ms both';
          card.addEventListener('mousedown', function(e){
            var rect = card.getBoundingClientRect();
            var matrix = new DOMMatrix(window.getComputedStyle(card).transform);
            var angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
            card.style.animation = 'none';
            card.style.position = 'fixed';
            card.style.left = rect.left + 'px';
            card.style.top  = rect.top  + 'px';
            card.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';
            card.style.opacity = '1';
            card.style.zIndex = '50';
            card.style.cursor = 'grabbing';
            dragState = { card: card, ox: e.clientX - rect.left, oy: e.clientY - rect.top };
            e.preventDefault();
            e.stopPropagation();
          });
          card.addEventListener('touchstart', function(e){
            var t = e.touches[0];
            var rect = card.getBoundingClientRect();
            var matrix = new DOMMatrix(window.getComputedStyle(card).transform);
            var angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
            card.style.animation = 'none';
            card.style.position = 'fixed';
            card.style.left = rect.left + 'px';
            card.style.top  = rect.top  + 'px';
            card.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';
            card.style.opacity = '1';
            card.style.zIndex = '50';
            dragState = { card: card, ox: t.clientX - rect.left, oy: t.clientY - rect.top };
            e.preventDefault();
          }, { passive: false });
          cardsContainer.appendChild(card);
        });
      }

      reveal.classList.add('is-active');
      reveal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      revealClose.focus();
    }

    function closeReveal(){
      /* hide reveal, go back to locker room */
      reveal.classList.remove('is-active');
      reveal.setAttribute('aria-hidden', 'true');
      if (cardsContainer) cardsContainer.innerHTML = '';
      openLR(null);
    }

    document.addEventListener('click', function(e){
      var btn = e.target.closest('.locker-door');
      if (btn) openReveal(btn);
    });

    revealClose.addEventListener('click', closeReveal);
    revealBackdrop.addEventListener('click', closeReveal);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && reveal.classList.contains('is-active')) closeReveal();
    });

  })();

  /* ---- Model carousel ---- */
  (function(){
    var photos = ['assets/img/models/P1.webp','assets/img/models/P2.webp','assets/img/models/P3.webp','assets/img/models/P4.webp','assets/img/models/P5.webp','assets/img/models/P6.webp','assets/img/models/P7.webp','assets/img/models/P8.webp'];
    var current = 0;
    var photoEl = document.getElementById('modelPhoto');
    var countEl = document.getElementById('modelCount');
    var prevBtn = document.getElementById('modelPrev');
    var nextBtn = document.getElementById('modelNext');

    function updateCount(){
      countEl.textContent = String(current+1).padStart(2,'0') + ' / ' + String(photos.length).padStart(2,'0');
    }

    function goTo(index){
      current = (index + photos.length) % photos.length;
      photoEl.classList.add('is-fading');
      setTimeout(function(){
        photoEl.src = photos[current];
        photoEl.alt = 'Model ' + (current+1) + ' of ' + photos.length;
        photoEl.classList.remove('is-fading');
        updateCount();
      }, 250);
    }

    prevBtn.addEventListener('click', function(){ goTo(current - 1); });
    nextBtn.addEventListener('click', function(){ goTo(current + 1); });

    /* preload all models into browser image cache */
    window.addEventListener('load', function(){
      photos.slice(1).forEach(function(src){ var img = new Image(); img.src = src; });
    });
  })();

  /* ---- About modal ---- */
  (function(){
    var modal    = document.getElementById('aboutModal');
    var backdrop = document.getElementById('aboutBackdrop');
    var closeBtn = document.getElementById('aboutClose');
    var triggers = document.querySelectorAll('.about-trigger');

    function openAbout(e){
      if (e) e.preventDefault();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeAbout(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggers.forEach(function(t){ t.addEventListener('click', openAbout); });
    backdrop.addEventListener('click', closeAbout);
    closeBtn.addEventListener('click', closeAbout);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeAbout();
    });
  })();

  /* ---- Custom cursor ---- */
  (function(){
    var cursor = document.getElementById('customCursor');
    if (!cursor) return;

    var visible = false;

    document.addEventListener('mousemove', function(e){
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      if (!visible){ cursor.classList.add('is-visible'); visible = true; }
    });

    document.addEventListener('mouseleave', function(){ cursor.classList.remove('is-visible'); visible = false; });
    document.addEventListener('mouseenter', function(){ cursor.classList.add('is-visible'); visible = true; });

    document.addEventListener('mouseover', function(e){
      if (e.target.closest('a, button, [role="button"], label, .reveal-card, .cta, .lr-locker'))
        cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', function(e){
      if (e.target.closest('a, button, [role="button"], label, .reveal-card, .cta, .lr-locker'))
        cursor.classList.remove('is-hover');
    });

    document.addEventListener('mousedown', function(){ cursor.classList.add('is-grabbing'); });
    document.addEventListener('mouseup',   function(){ cursor.classList.remove('is-grabbing'); });
  })();

  /* ---- Hold-to-scroll ---- */
  (function(){
    var trigger  = document.getElementById('holdTrigger');
    var ringFill = document.getElementById('holdRingFill');
    var footer   = document.getElementById('contact');
    if (!trigger || !ringFill || !footer) return;

    var HOLD_MS      = 1200;
    var CIRCUMFERENCE = 113;
    var interval     = null;
    var progress     = 0;

    function setRing(p) {
      ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(p, 1));
    }

    function startHold() {
      if (interval) return;
      interval = setInterval(function() {
        progress += 50 / HOLD_MS;
        setRing(progress);
        if (progress >= 1) {
          clearInterval(interval); interval = null;
          footer.scrollIntoView({ behavior: 'smooth' });
          setTimeout(function() { progress = 0; setRing(0); }, 700);
        }
      }, 50);
    }

    function cancelHold() {
      if (interval) { clearInterval(interval); interval = null; }
      progress = 0;
      setRing(0);
    }

    trigger.addEventListener('mousedown',  startHold);
    trigger.addEventListener('touchstart', startHold, { passive: true });
    document.addEventListener('mouseup',   cancelHold);
    document.addEventListener('touchend',  cancelHold);
  })();

  /* ---- Block normal scroll on hero — only hold trigger navigates down ---- */
  (function(){
    window.addEventListener('wheel', function(e) {
      if (window.scrollY === 0 && e.deltaY > 0) e.preventDefault();
    }, { passive: false });

    var touchStartY = 0;
    window.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function(e) {
      if (window.scrollY === 0 && (touchStartY - e.touches[0].clientY) > 15) e.preventDefault();
    }, { passive: false });
  })();
