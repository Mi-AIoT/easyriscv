// i18n/i18n.js - Internationalization module
// SPDX-License-Identifier: CC0-1.0 OR 0BSD

const SUPPORTED_LANGUAGES = ['en', 'zh-CN'];
const DEFAULT_LANGUAGE = 'en';

// Current language state
let currentLanguage = DEFAULT_LANGUAGE;

// Translation dictionaries cache
const translations = {};

/**
 * Load translation file for a language
 * @param {string} lang - Language code (e.g., 'en', 'zh-CN')
 */
async function loadTranslations(lang) {
    if (translations[lang]) {
        return translations[lang];
    }

    try {
        const response = await fetch(`i18n/locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${lang}`);
        }
        const data = await response.json();
        translations[lang] = data;
        return data;
    } catch (error) {
        console.warn(`Could not load translations for ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
        if (lang !== DEFAULT_LANGUAGE) {
            return loadTranslations(DEFAULT_LANGUAGE);
        }
        return {};
    }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'buttons.run')
 * @param {string} fallback - Fallback text if key not found
 * @returns {string} - Translated text or fallback
 */
export function t(key, fallback = '') {
    // Nested lookup helper
    const getNested = (obj, path) => {
        return path.split('.').reduce((acc, part) => {
            return acc && acc[part] !== undefined ? acc[part] : undefined;
        }, obj);
    };

    const dict = translations[currentLanguage] || {};
    const value = getNested(dict, key);

    if (value === undefined) {
        // Try fallback language
        const fallbackDict = translations[DEFAULT_LANGUAGE] || {};
        const fallbackValue = getNested(fallbackDict, key);
        return fallbackValue !== undefined ? fallbackValue : fallback;
    }

    return value;
}

/**
 * Get current language code
 * @returns {string} - Current language code
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Set language and load translations
 * @param {string} lang - Language code to set
 * @returns {Promise<boolean>} - True if language was set successfully
 */
export async function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        console.warn(`Language ${lang} is not supported`);
        return false;
    }

    await loadTranslations(lang);
    currentLanguage = lang;

    // Save preference
    try {
        localStorage.setItem('easyriscv-lang', lang);
    } catch (e) {
        // localStorage not available
    }

    return true;
}

/**
 * Initialize i18n - set language based on current page URL
 * @returns {Promise<string>} - The initialized language code
 */
export async function initI18n() {
    const path = window.location.pathname;
    let lang = 'en';
    if (path.endsWith('index-zh.html')) {
        lang = 'zh-CN';
    }

    await setLanguage(lang);
    return lang;
}

/**
 * Get list of supported languages
 * @returns {string[]} - Array of supported language codes
 */
export function getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
}
