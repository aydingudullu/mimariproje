/**
 * Accessibility Utilities
 * Frontend için erişilebilirlik yardımcı fonksiyonları
 */

/**
 * Aria-label generator için yardımcı fonksiyonlar
 */
export const accessibilityHelpers = {
  /**
   * Button için aria-label oluştur
   */
  buttonLabel: (action: string, target?: string): string => {
    return target ? `${action}: ${target}` : action;
  },

  /**
   * Link için açıklayıcı metin
   */
  linkLabel: (destination: string, opensNewTab?: boolean): string => {
    const newTabText = opensNewTab ? ' (yeni sekmede açılır)' : '';
    return `${destination}${newTabText}`;
  },

  /**
   * Form field için label
   */
  fieldLabel: (fieldName: string, required?: boolean, error?: string): string => {
    let label = fieldName;
    if (required) label += ' (zorunlu)';
    if (error) label += `. Hata: ${error}`;
    return label;
  },

  /**
   * Resim için alt text oluştur
   */
  imageAlt: (context: string, fallback?: string): string => {
    return context || fallback || 'Görsel içerik';
  },

  /**
   * Loading state için aria-live mesajı
   */
  loadingMessage: (itemType: string): string => {
    return `${itemType} yükleniyor, lütfen bekleyin`;
  },

  /**
   * Success message
   */
  successMessage: (action: string): string => {
    return `${action} başarıyla tamamlandı`;
  },

  /**
   * Error message
   */
  errorMessage: (action: string, error?: string): string => {
    return error ? `${action} sırasında hata: ${error}` : `${action} başarısız oldu`;
  },

  /**
   * Navigation landmark label
   */
  navigationLabel: (section: string): string => {
    return `${section} navigasyonu`;
  },

  /**
   * Table caption
   */
  tableCaption: (dataType: string, count: number): string => {
    return `${dataType} listesi, toplam ${count} kayıt`;
  },
};

/**
 * Keyboard navigation yardımcıları
 */
export const keyboardHelpers = {
  /**
   * Focusable element olup olmadığını kontrol et
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return focusableSelectors.some(selector => element.matches(selector));
  },

  /**
   * Tab sırası için önerilen tabindex değerleri
   */
  tabIndexValues: {
    focusable: 0,
    notFocusable: -1,
    prioritized: 1, // Use sparingly
  },

  /**
   * Önemli kısayol tuşları
   */
  shortcuts: {
    close: 'Escape',
    confirm: 'Enter',
    navigate: 'Tab',
    navigateBack: 'Shift+Tab',
    selectItem: 'Space',
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
  },
};

/**
 * WCAG 2.1 uyumluluk kontrolleri
 */
export const wcagChecklist = {
  /**
   * Renk kontrast oranı hesapla (basit versiyon)
   */
  checkContrastRatio: (foreground: string, background: string): { ratio: number; passes: boolean } => {
    // Simplified contrast check - in production use a proper library
    // This is a placeholder implementation
    return { ratio: 4.5, passes: true };
  },

  /**
   * WCAG gereksinimleri özeti
   */
  requirements: {
    perceivable: [
      'Text alternatives for non-text content',
      'Captions for audio content',
      'Content adaptable to different presentations',
      'Color contrast ratio of at least 4.5:1',
    ],
    operable: [
      'All functionality available from keyboard',
      'Enough time to read content',
      'No content that causes seizures',
      'Navigable with clear focus',
    ],
    understandable: [
      'Readable text content',
      'Predictable page behavior',
      'Input assistance for forms',
    ],
    robust: [
      'Compatible with assistive technologies',
      'Valid HTML markup',
    ],
  },

  /**
   * Minimum gereksinimleri kontrol etmek için checklist
   */
  minimumChecklist: [
    { id: 'alt_text', description: 'Tüm resimlerde alt text var', category: 'perceivable' },
    { id: 'form_labels', description: 'Form alanlarında label var', category: 'perceivable' },
    { id: 'keyboard_nav', description: 'Klavye ile navigasyon çalışıyor', category: 'operable' },
    { id: 'focus_visible', description: 'Focus durumu görünür', category: 'operable' },
    { id: 'error_messages', description: 'Hata mesajları açık', category: 'understandable' },
    { id: 'consistent_nav', description: 'Tutarlı navigasyon', category: 'understandable' },
    { id: 'valid_html', description: 'Geçerli HTML markup', category: 'robust' },
    { id: 'aria_roles', description: 'Doğru ARIA rolleri', category: 'robust' },
  ],
};

/**
 * Screen reader için yardımcılar
 */
export const screenReaderHelpers = {
  /**
   * Gizli ama screen reader tarafından okunabilir metin
   */
  srOnlyClass: 'sr-only',
  
  /**
   * SR-only için CSS
   */
  srOnlyCSS: `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .sr-only-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      margin: 0;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `,

  /**
   * ARIA live region türleri
   */
  liveRegions: {
    polite: 'polite', // Wait for user to finish current task
    assertive: 'assertive', // Interrupt user immediately
    off: 'off', // Do not announce
  },

  /**
   * Dinamik içerik için aria-live bölgesi oluştur
   */
  createLiveRegion: (politeness: 'polite' | 'assertive' = 'polite'): string => {
    return `<div aria-live="${politeness}" aria-atomic="true" class="sr-only"></div>`;
  },
};

export default {
  accessibilityHelpers,
  keyboardHelpers,
  wcagChecklist,
  screenReaderHelpers,
};
