/**
 * TQuant Lab - Main JavaScript (Simplified)
 * 
 * Simplified version without complex visual effects.
 * Focus on core functionality: theme and sidebar toggles.
 */

(function () {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    ICONS: {
      SUN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`,
      MOON: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`,
      CHEVRON_RIGHT: 'M8.59 16.41L10 18l6-6-6-6-1.41 1.41L13.17 12z',
      CHEVRON_LEFT: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z',
      CHECK_CIRCLE: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
    }
  };

  // ==========================================================================
  // State Management
  // ==========================================================================

  const STATE = {
    isDark: () => document.documentElement.getAttribute('data-md-color-scheme') === 'slate'
  };

  // ==========================================================================
  // Theme Management
  // ==========================================================================

  const ThemeManager = {
    updateToggleIcon() {
      const toggle = document.querySelector('.custom-theme-toggle');
      if (toggle) {
        toggle.innerHTML = STATE.isDark() ? CONFIG.ICONS.SUN : CONFIG.ICONS.MOON;
      }
    },

    initObserver() {
      this.updateToggleIcon();

      const observer = new MutationObserver(() => this.updateToggleIcon());
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-md-color-scheme']
      });
    },

    switchTheme() {
      // Find the palette inputs (MkDocs Material's native theme switcher)
      const inputs = document.querySelectorAll('input[name="__palette"]');

      if (inputs.length > 0) {
        // Click the input that is NOT currently checked
        // This triggers MkDocs Material's complete theme switching logic
        for (const input of inputs) {
          if (!input.checked) {
            input.click();
            break;
          }
        }
      } else {
        // Fallback: direct attribute change (may not work fully)
        const newScheme = STATE.isDark() ? 'default' : 'slate';
        document.documentElement.setAttribute('data-md-color-scheme', newScheme);
        localStorage.setItem('data-md-color-scheme', newScheme);
      }

      // Update icon immediately
      this.updateToggleIcon();
    },

    createToggleButton() {
      const header = document.querySelector('.md-header__inner');
      if (!header || document.querySelector('.custom-theme-toggle')) return;

      const button = document.createElement('button');
      button.className = 'custom-theme-toggle';
      button.setAttribute('aria-label', 'Switch Theme');
      button.innerHTML = STATE.isDark() ? CONFIG.ICONS.SUN : CONFIG.ICONS.MOON;

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        this.switchTheme();
      });

      const searchForm = header.querySelector('.md-search');
      if (searchForm) {
        header.insertBefore(button, searchForm);
      } else {
        header.appendChild(button);
      }

      this.initObserver();
    }
  };

  // ==========================================================================
  // Sidebar Management
  // ==========================================================================

  const SidebarManager = {
    setupToggle(type, iconPath) {
      const sidebar = document.querySelector(`.md-sidebar--${type}`);
      if (!sidebar || document.querySelector(`.md-sidebar-toggle--${type}`)) return;

      const container = this.getOrCreateContainer();
      const button = document.createElement('button');
      button.className = `md-sidebar-toggle md-sidebar-toggle--${type}`;
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${iconPath}"/></svg>`;

      container.appendChild(button);

      const storageKey = `md-sidebar-${type}-collapsed`;
      let isCollapsed = localStorage.getItem(storageKey) === 'true';

      const applyState = () => {
        sidebar.classList.toggle('sidebar-collapsed', isCollapsed);
        button.classList.toggle('collapsed', isCollapsed);
      };

      if (isCollapsed) applyState();

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        localStorage.setItem(storageKey, isCollapsed);
        applyState();
      });
    },

    getOrCreateContainer() {
      let container = document.querySelector('.md-sidebar-toggle-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'md-sidebar-toggle-container';
        document.body.appendChild(container);
      }
      return container;
    },

    init() {
      this.setupToggle('secondary', CONFIG.ICONS.CHEVRON_RIGHT);
      this.setupToggle('primary', CONFIG.ICONS.CHEVRON_LEFT);
    }
  };

  // ==========================================================================
  // Shop Button
  // ==========================================================================

  const ShopButton = {
    create() {
      const sidebar = document.querySelector('.md-sidebar--primary .md-nav');
      if (!sidebar || document.querySelector('.md-header__shop-btn')) return;

      const button = document.createElement('a');
      button.className = 'md-header__shop-btn';
      button.href = 'https://tquant.tejwin.com/shop/';
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="${CONFIG.ICONS.CHECK_CIRCLE}"/>
        </svg>
        <span>訂閱TQuantlab</span>
      `;

      sidebar.prepend(button);
    }
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function initialize() {
    ShopButton.create();
    ThemeManager.createToggleButton();
    SidebarManager.init();

    // Support for MkDocs Material instant loading
    if (window.document$) {
      window.document$.subscribe(() => {
        ShopButton.create();
        ThemeManager.createToggleButton();
        const toggle = document.querySelector('.custom-theme-toggle');
        if (toggle) {
          toggle.innerHTML = STATE.isDark() ? CONFIG.ICONS.SUN : CONFIG.ICONS.MOON;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initialize);

})();