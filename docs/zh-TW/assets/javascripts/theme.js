/**
 * TQuant Lab - Main JavaScript
 * 
 * Table of Contents:
 * 1. Theme Management
 * 2. TQuantLab Button
 * 3. Custom Theme Toggle
 * 4. Sidebar Toggle
 * 5. Loading Animation
 * 6. Theme Transition Effects
 * 7. Search Lightning Effect
 */

(function() {
  'use strict';



  // ==========================================================================
  // 2. TQuantLab Button
  // ==========================================================================

  /**
   * Add TQuantLab button to header
   */
  function addTQuantLabButton() {
    const header = document.querySelector('.md-header__inner');
    if (header && !document.querySelector('.md-header__shop-btn')) {
      const shopBtn = document.createElement('a');
      shopBtn.className = 'md-header__shop-btn';
      shopBtn.href = 'https://tquant.tejwin.com/shop/';
      shopBtn.target = '_blank';
      shopBtn.rel = 'noopener noreferrer';
      shopBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>訂閱TQuantlab</span>
      `;
      header.appendChild(shopBtn);
    }
  }

  // ==========================================================================
  // 3. Custom Theme Toggle
  // ==========================================================================

  /**
   * SVG icons for theme toggle
   */
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`;

  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;

  /**
   * Add custom theme toggle button
   */
  function addThemeToggle() {
    const headerNav = document.querySelector('.md-header__inner');
    if (headerNav && !document.querySelector('.custom-theme-toggle')) {
      const themeToggle = document.createElement('button');
      themeToggle.className = 'custom-theme-toggle';
      themeToggle.setAttribute('aria-label', '切換深色/淺色模式');
      themeToggle.setAttribute('title', '切換深色/淺色模式');
      
      const updateIcon = () => {
        const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
        themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
      };
      
      updateIcon();
      
      themeToggle.addEventListener('click', function() {
        const body = document.body;
        const currentScheme = body.getAttribute('data-md-color-scheme');
        const newScheme = currentScheme === 'slate' ? 'default' : 'slate';
        
        // Play cyberpunk theme transition effect
        playCyberpunkThemeTransition();
        
        // Delay actual theme change slightly for effect
        setTimeout(() => {
          body.setAttribute('data-md-color-scheme', newScheme);
          
          // Update palette inputs if exists
          const paletteInputs = document.querySelectorAll('input[name="__palette"]');
          paletteInputs.forEach((input, index) => {
            if (newScheme === 'slate' && index === 1) {
              input.checked = true;
            } else if (newScheme === 'default' && index === 0) {
              input.checked = true;
            }
          });
          
          localStorage.setItem('data-md-color-scheme', newScheme);
          updateIcon();
        }, 150);
      });
      
      const searchForm = headerNav.querySelector('.md-search');
      if (searchForm) {
        headerNav.insertBefore(themeToggle, searchForm);
      } else {
        headerNav.appendChild(themeToggle);
      }
    }
  }

  // ==========================================================================
  // 4. Sidebar Toggle
  // ==========================================================================

  /**
   * Create sidebar toggle buttons
   */
  function createSidebarToggles() {
    // Create container for toggle buttons
    let buttonContainer = document.querySelector('.md-sidebar-toggle-container');
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.className = 'md-sidebar-toggle-container';
      document.body.appendChild(buttonContainer);
    }
    
    // Right sidebar (Table of Contents)
    const secondarySidebar = document.querySelector('.md-sidebar--secondary');
    if (secondarySidebar && !document.querySelector('.md-sidebar-toggle--secondary')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'md-sidebar-toggle md-sidebar-toggle--secondary';
      toggleBtn.setAttribute('aria-label', '收合目錄');
      toggleBtn.setAttribute('title', '收合目錄');
      toggleBtn.setAttribute('type', 'button');
      toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.59 16.41L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
      
      buttonContainer.appendChild(toggleBtn);
      
      const savedSecondaryState = localStorage.getItem('md-sidebar-secondary-collapsed');
      let isSecondaryCollapsed = savedSecondaryState === null ? true : savedSecondaryState === 'true';
      
      if (isSecondaryCollapsed) {
        secondarySidebar.classList.add('sidebar-collapsed');
        toggleBtn.classList.add('collapsed');
        toggleBtn.setAttribute('title', '展開目錄');
      }
      
      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isSecondaryCollapsed = !isSecondaryCollapsed;
        
        if (isSecondaryCollapsed) {
          secondarySidebar.classList.add('sidebar-collapsed');
          toggleBtn.classList.add('collapsed');
          toggleBtn.setAttribute('title', '展開目錄');
        } else {
          secondarySidebar.classList.remove('sidebar-collapsed');
          toggleBtn.classList.remove('collapsed');
          toggleBtn.setAttribute('title', '收合目錄');
        }
        
        localStorage.setItem('md-sidebar-secondary-collapsed', isSecondaryCollapsed);
        return false;
      });
    }
    
    // Left sidebar (Navigation)
    const primarySidebar = document.querySelector('.md-sidebar--primary');
    if (primarySidebar && !document.querySelector('.md-sidebar-toggle--primary')) {
      const toggleBtnLeft = document.createElement('button');
      toggleBtnLeft.className = 'md-sidebar-toggle md-sidebar-toggle--primary';
      toggleBtnLeft.setAttribute('aria-label', '收合選單');
      toggleBtnLeft.setAttribute('title', '收合選單');
      toggleBtnLeft.setAttribute('type', 'button');
      toggleBtnLeft.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      
      buttonContainer.appendChild(toggleBtnLeft);
      
      const savedPrimaryState = localStorage.getItem('md-sidebar-primary-collapsed');
      let isPrimaryCollapsed = savedPrimaryState === null ? true : savedPrimaryState === 'true';
      
      if (isPrimaryCollapsed) {
        primarySidebar.classList.add('sidebar-collapsed');
        toggleBtnLeft.classList.add('collapsed');
        toggleBtnLeft.setAttribute('title', '展開選單');
      }
      
      toggleBtnLeft.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isPrimaryCollapsed = !isPrimaryCollapsed;
        
        if (isPrimaryCollapsed) {
          primarySidebar.classList.add('sidebar-collapsed');
          toggleBtnLeft.classList.add('collapsed');
          toggleBtnLeft.setAttribute('title', '展開選單');
        } else {
          primarySidebar.classList.remove('sidebar-collapsed');
          toggleBtnLeft.classList.remove('collapsed');
          toggleBtnLeft.setAttribute('title', '收合選單');
        }
        
        localStorage.setItem('md-sidebar-primary-collapsed', isPrimaryCollapsed);
        return false;
      });
    }
  }

  // ==========================================================================
  // 5. Loading Animation
  // ==========================================================================

  /**
   * Show loading animation on homepage
   */
  function showLoader() {
    const path = window.location.pathname;
    const isHomepage = path === '/' || 
                       path.endsWith('/index.html') || 
                       path.endsWith('/zh-TW/') ||
                       path === '/zh-TW' ||
                       path === '' ||
                       /\/zh-TW\/?$/.test(path);
    
    const loaderShown = sessionStorage.getItem('tquant-loader-shown');
    
    if (isHomepage && !loaderShown) {
      const loaderHTML = `
        <div class="tquant-loader" id="tquant-loader">
          <div class="loader-scanline"></div>
          <div class="loader-logo-container">
            <div class="loader-particles">
              <div class="particle"></div>
              <div class="particle"></div>
              <div class="particle"></div>
              <div class="particle"></div>
              <div class="particle"></div>
              <div class="particle"></div>
            </div>
            <div class="loader-ring loader-ring-1"></div>
            <div class="loader-ring loader-ring-2"></div>
            <div class="loader-ring loader-ring-3"></div>
            <img src="assets/images/logo.png" alt="TQuant Lab" class="loader-logo-img" />
          </div>
          <div class="loader-text">TQuant Lab</div>
          <div class="loader-progress">
            <div class="loader-progress-bar"></div>
          </div>
          <div class="loader-dots">
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
            <div class="loader-dot"></div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('afterbegin', loaderHTML);
      
      setTimeout(function() {
        const loader = document.getElementById('tquant-loader');
        if (loader) {
          loader.classList.add('fade-out');
          setTimeout(function() {
            loader.remove();
            document.body.setAttribute('data-md-color-scheme', 'slate');
            localStorage.setItem('data-md-color-scheme', 'slate');
          }, 800);
        }
      }, 2500);
      
      sessionStorage.setItem('tquant-loader-shown', 'true');
    }
  }

  // ==========================================================================
  // 6. Theme Transition Effects
  // ==========================================================================

  /**
   * Create theme transition elements
   */
  function createThemeTransitionElements() {
    if (!document.querySelector('.theme-transition-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'theme-transition-overlay';
      document.body.appendChild(overlay);
    }
    
    if (!document.querySelector('.theme-transition-logo')) {
      const logo = document.createElement('img');
      logo.className = 'theme-transition-logo';
      const baseUrl = document.querySelector('link[rel="canonical"]')?.href?.replace(/[^/]*$/, '') || '/zh-TW/';
      logo.src = baseUrl + 'assets/images/logo.png';
      logo.onerror = function() {
        this.src = '/zh-TW/assets/images/logo.png';
        this.onerror = function() {
          this.src = '../assets/images/logo.png';
        };
      };
      logo.alt = 'TQuant Lab';
      document.body.appendChild(logo);
    }
    
    if (!document.querySelector('.theme-ripple')) {
      const ripple = document.createElement('div');
      ripple.className = 'theme-ripple';
      document.body.appendChild(ripple);
    }
    
    // Create cyberpunk effect elements
    if (!document.querySelector('.theme-glitch-overlay')) {
      const glitch = document.createElement('div');
      glitch.className = 'theme-glitch-overlay';
      document.body.appendChild(glitch);
    }
    
    if (!document.querySelector('.theme-hex-grid')) {
      const hexGrid = document.createElement('div');
      hexGrid.className = 'theme-hex-grid';
      document.body.appendChild(hexGrid);
    }
    
    if (!document.querySelector('.theme-center-burst')) {
      const burst = document.createElement('div');
      burst.className = 'theme-center-burst';
      document.body.appendChild(burst);
    }
    
    if (!document.querySelector('.theme-scanline-sweep')) {
      const scanline = document.createElement('div');
      scanline.className = 'theme-scanline-sweep';
      document.body.appendChild(scanline);
    }
  }

  /**
   * Play cyberpunk theme transition animation
   */
  function playCyberpunkThemeTransition() {
    createThemeTransitionElements();
    
    const glitch = document.querySelector('.theme-glitch-overlay');
    const hexGrid = document.querySelector('.theme-hex-grid');
    const burst = document.querySelector('.theme-center-burst');
    const scanline = document.querySelector('.theme-scanline-sweep');
    const overlay = document.querySelector('.theme-transition-overlay');
    const logo = document.querySelector('.theme-transition-logo');
    const ripple = document.querySelector('.theme-ripple');
    
    // Stage 1: Center burst and scanline
    burst.classList.add('active');
    scanline.classList.add('active');
    
    // Stage 2: Glitch and hex grid
    setTimeout(() => {
      glitch.classList.add('active');
      hexGrid.classList.add('active');
    }, 100);
    
    // Stage 3: Logo and ripple
    setTimeout(() => {
      ripple.classList.add('active');
      overlay.classList.add('active');
      logo.classList.add('active');
    }, 200);
    
    // Cleanup
    setTimeout(() => {
      logo.classList.remove('active');
      overlay.classList.remove('active');
    }, 500);
    
    setTimeout(() => {
      burst.classList.remove('active');
      scanline.classList.remove('active');
      glitch.classList.remove('active');
      hexGrid.classList.remove('active');
      ripple.classList.remove('active');
    }, 800);
  }

  /**
   * Play theme transition animation (legacy)
   */
  function playThemeTransition() {
    playCyberpunkThemeTransition();
  }

  /**
   * Watch for theme toggle clicks
   */
  function watchThemeToggle() {
    const paletteInputs = document.querySelectorAll('input[name="__palette"]');
    paletteInputs.forEach(input => {
      input.addEventListener('change', playCyberpunkThemeTransition);
    });
    
    const paletteLabels = document.querySelectorAll('label[for^="__palette"]');
    paletteLabels.forEach(label => {
      label.addEventListener('click', () => {
        setTimeout(playCyberpunkThemeTransition, 50);
      });
    });
  }

  // ==========================================================================
  // 7. Search Lightning Effect - ULTRA EPIC VERSION
  // ==========================================================================

  /**
   * Create epic lightning trail with multiple branches
   */
  function createLightningTrail() {
    // Remove existing
    const existing = document.querySelector('.lightning-trail');
    if (existing) existing.remove();
    
    const trail = document.createElement('div');
    trail.className = 'lightning-trail';
    
    // Generate random lightning path with branches
    const generatePath = () => {
      let d = 'M50,0 ';
      let y = 0;
      let x = 50;
      
      while (y < 200) {
        const dx = (Math.random() - 0.5) * 40;
        const dy = Math.random() * 30 + 10;
        x = Math.max(10, Math.min(90, x + dx));
        y += dy;
        d += `L${x},${y} `;
      }
      return d;
    };
    
    trail.innerHTML = `
      <svg viewBox="0 0 100 200" preserveAspectRatio="none">
        <path d="${generatePath()}" />
        <path class="branch" d="${generatePath()}" style="opacity: 0.6" />
        <path class="branch" d="${generatePath()}" style="opacity: 0.4" />
      </svg>
    `;
    trail.style.cssText = `
      position: fixed;
      top: 3.5rem;
      left: 50%;
      width: 100px;
      height: calc(50vh - 3.5rem);
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(trail);
    return trail;
  }

  /**
   * Create electric sparks explosion
   */
  function createElectricSparks() {
    const existing = document.querySelector('.electric-sparks');
    if (existing) existing.remove();
    
    const sparks = document.createElement('div');
    sparks.className = 'electric-sparks';
    
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark';
      sparks.appendChild(spark);
    }
    
    document.body.appendChild(sparks);
    return sparks;
  }

  /**
   * Create screen flash effect
   */
  function createScreenFlash() {
    const existing = document.querySelector('.screen-flash');
    if (existing) existing.remove();
    
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    return flash;
  }

  /**
   * Create electric ring explosions
   */
  function createElectricRings() {
    const existing = document.querySelectorAll('.electric-ring');
    existing.forEach(el => el.remove());
    
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'electric-ring';
      document.body.appendChild(ring);
      rings.push(ring);
    }
    return rings;
  }

  /**
   * Create search secret button
   */
  function createSearchLightningButton() {
    if (!document.querySelector('.search-lightning-btn')) {
      const btn = document.createElement('a');
      btn.className = 'search-lightning-btn';
      btn.href = 'https://tquant.tejwin.com/shop/';
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.innerHTML = `
        <span class="scan-line"></span>
        <span style="position: relative; z-index: 1;">⚡ 點擊查看更多秘密 ⚡</span>
      `;
      btn.setAttribute('title', '發現秘密！');
      document.body.appendChild(btn);
    }
  }

  /**
   * Play EPIC lightning animation from header to center
   */
  function playLightningAnimation(showCenter) {
    const headerBtn = document.querySelector('.md-header__shop-btn');
    const lightningBtn = document.querySelector('.search-lightning-btn');
    
    if (showCenter) {
      // Header button transforms into lightning and disappears
      if (headerBtn) {
        headerBtn.classList.add('lightning-out');
      }
      
      // Create all effect elements
      const trail = createLightningTrail();
      const sparks = createElectricSparks();
      const flash = createScreenFlash();
      const rings = createElectricRings();
      
      // Stage 1: Screen flash
      setTimeout(() => {
        flash.classList.add('active');
      }, 100);
      
      // Stage 2: Lightning trail
      setTimeout(() => {
        trail.classList.add('active');
      }, 150);
      
      // Stage 3: Second lightning bolt (regenerate path for variation)
      setTimeout(() => {
        const trail2 = createLightningTrail();
        trail2.classList.add('active');
        setTimeout(() => trail2.remove(), 500);
      }, 200);
      
      // Stage 4: Electric rings explosion
      setTimeout(() => {
        rings.forEach((ring, i) => {
          setTimeout(() => ring.classList.add('active'), i * 100);
        });
      }, 300);
      
      // Stage 5: Sparks explosion
      setTimeout(() => {
        sparks.classList.add('active');
      }, 350);
      
      // Stage 6: Show center button with dramatic entrance
      setTimeout(() => {
        if (lightningBtn) {
          lightningBtn.classList.add('active');
        }
      }, 400);
      
      // Cleanup effects
      setTimeout(() => {
        trail.remove();
        flash.remove();
        sparks.remove();
        rings.forEach(ring => ring.remove());
      }, 1000);
      
    } else {
      // Hide center button
      if (lightningBtn) {
        lightningBtn.classList.remove('active');
      }
      
      // Restore header button
      if (headerBtn) {
        setTimeout(() => {
          headerBtn.classList.remove('lightning-out');
        }, 300);
      }
    }
  }

  /**
   * Watch for search state changes
   */
  function watchSearchState() {
    createSearchLightningButton();
    
    const lightningBtn = document.querySelector('.search-lightning-btn');
    
    if (!lightningBtn) return;
    
    // Watch for search toggle changes
    const searchToggle = document.querySelector('[data-md-toggle="search"]');
    if (searchToggle) {
      searchToggle.addEventListener('change', () => {
        setTimeout(() => {
          const isActive = searchToggle.checked;
          playLightningAnimation(isActive);
        }, 50);
      });
    }
    
    // Watch for search input focus
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        playLightningAnimation(true);
      });
      
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          const isSearchActive = document.querySelector('[data-md-toggle="search"]:checked');
          if (!isSearchActive) {
            playLightningAnimation(false);
          }
        }, 200);
      });
    }
    
    // Watch for search overlay click (to close)
    document.addEventListener('click', (e) => {
      const searchContainer = document.querySelector('.md-search');
      const isClickOnLightning = e.target.closest('.search-lightning-btn');
      
      if (searchContainer && !searchContainer.contains(e.target) && !isClickOnLightning) {
        const lightningBtn = document.querySelector('.search-lightning-btn');
        if (lightningBtn && lightningBtn.classList.contains('active')) {
          playLightningAnimation(false);
        }
      }
    });
    
    // Watch for Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        playLightningAnimation(false);
      }
    });
  }

  // ==========================================================================
  // Initialize on DOM Ready
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', function() {
    addTQuantLabButton();
    addThemeToggle();
    createSidebarToggles();
    showLoader();
    watchThemeToggle();
    watchSearchState();
  });

})();
