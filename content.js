// HackerOne Color Replacer Content Script - Aggressive Version
(function() {
    'use strict';
    
    // Global variables
    let isEnabled = true;
    let intervals = [];
    let eventListeners = [];
    let observer = null;

    // Define all color patterns and their replacements
    const colorMappings = [
        // Main combined regex - exactly as requested
        { pattern: /rgb\(28 31 53 \/ var\(--tw-bg-opacity(?:, 1)?\)\)|rgb\(38 43 68 \/ var\(--tw-bg-opacity\)\)|#262b44/g, replacement: '#161616' },
        // String replacement
        { pattern: /#1C1F35/gi, replacement: '#161616' },
        // Additional comprehensive patterns
        { pattern: /rgb\(28,\s*31,\s*53\)/gi, replacement: '#161616' },
        { pattern: /rgb\(38,\s*43,\s*68\)/gi, replacement: '#161616' },
        { pattern: /rgb\(28\s+31\s+53\)/gi, replacement: '#161616' },
        { pattern: /rgb\(38\s+43\s+68\)/gi, replacement: '#161616' },
        { pattern: /rgba\(28,\s*31,\s*53,\s*[0-9.]+\)/gi, replacement: '#161616' },
        { pattern: /rgba\(38,\s*43,\s*68,\s*[0-9.]+\)/gi, replacement: '#161616' },
        { pattern: /rgba\(28\s+31\s+53\s*\/\s*[0-9.]+\)/gi, replacement: '#161616' },
        { pattern: /rgba\(38\s+43\s+68\s*\/\s*[0-9.]+\)/gi, replacement: '#161616' },
        // CSS variables and computed values
        { pattern: /--tw-bg-opacity:\s*1/gi, replacement: '--tw-bg-opacity: 1' },
        { pattern: /background-color:\s*rgb\(28\s+31\s+53\)/gi, replacement: 'background-color: #161616' },
        { pattern: /background-color:\s*rgb\(38\s+43\s+68\)/gi, replacement: 'background-color: #161616' },
        { pattern: /background:\s*rgb\(28\s+31\s+53\)/gi, replacement: 'background: #161616' },
        { pattern: /background:\s*rgb\(38\s+43\s+68\)/gi, replacement: 'background: #161616' }
    ];

    // Function to perform color replacements
    function replaceColors(text) {
        if (!text || typeof text !== 'string') return text;
        
        let modifiedText = text;
        colorMappings.forEach(mapping => {
            modifiedText = modifiedText.replace(mapping.pattern, mapping.replacement);
        });
        return modifiedText;
    }

    // Function to aggressively process computed styles
    function forceStyleOverride(element) {
        try {
            const computedStyle = window.getComputedStyle(element);
            const backgroundColor = computedStyle.backgroundColor;
            const color = computedStyle.color;
            
            // Check if element has problematic colors
            if (backgroundColor && (
                backgroundColor.includes('rgb(28, 31, 53)') || 
                backgroundColor.includes('rgb(38, 43, 68)') ||
                backgroundColor.includes('28 31 53') ||
                backgroundColor.includes('38 43 68') ||
                backgroundColor === '#262b44' ||
                backgroundColor === '#1c1f35'
            )) {
                element.style.setProperty('background-color', '#161616', 'important');
                element.style.setProperty('background', '#161616', 'important');
            }
            
            if (color && (
                color.includes('rgb(28, 31, 53)') || 
                color.includes('rgb(38, 43, 68)') ||
                color.includes('28 31 53') ||
                color.includes('38 43 68') ||
                color === '#262b44' ||
                color === '#1c1f35'
            )) {
                element.style.setProperty('color', '#161616', 'important');
            }
        } catch (e) {
            // Ignore errors
        }
    }

    // Function to process all elements aggressively
    function processAllElements() {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            // Process inline styles
            if (element.style && element.style.cssText) {
                const originalStyle = element.style.cssText;
                const modifiedStyle = replaceColors(originalStyle);
                if (originalStyle !== modifiedStyle) {
                    try {
                        element.style.cssText = modifiedStyle;
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
            
            // Force style override for computed styles
            forceStyleOverride(element);
            
            // Process attributes that might contain colors
            ['style', 'bgcolor', 'color'].forEach(attr => {
                if (element.hasAttribute(attr)) {
                    const originalValue = element.getAttribute(attr);
                    const modifiedValue = replaceColors(originalValue);
                    if (originalValue !== modifiedValue) {
                        element.setAttribute(attr, modifiedValue);
                    }
                }
            });
        });
    }

    // Function to safely process text nodes
    function processTextNodes(node) {
        if (!node) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
            const originalText = node.textContent;
            const modifiedText = replaceColors(originalText);
            if (originalText !== modifiedText) {
                node.textContent = modifiedText;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process style tags
            if (node.tagName === 'STYLE') {
                const originalContent = node.textContent;
                const modifiedContent = replaceColors(originalContent);
                if (originalContent !== modifiedContent) {
                    node.textContent = modifiedContent;
                }
            }
            
            // Process child nodes
            for (let child of node.childNodes) {
                processTextNodes(child);
            }
        }
    }

    // Function to safely process stylesheets
    function processStylesheets() {
        try {
            for (let i = 0; i < document.styleSheets.length; i++) {
                const stylesheet = document.styleSheets[i];
                try {
                    if (stylesheet.cssRules) {
                        for (let j = 0; j < stylesheet.cssRules.length; j++) {
                            const rule = stylesheet.cssRules[j];
                            if (rule.style && rule.style.cssText) {
                                const originalStyle = rule.style.cssText;
                                const modifiedStyle = replaceColors(originalStyle);
                                if (originalStyle !== modifiedStyle) {
                                    rule.style.cssText = modifiedStyle;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Skip inaccessible stylesheets
                }
            }
        } catch (e) {
            // Ignore stylesheet errors
        }
    }

    // Function to add aggressive CSS override
    function addAggressiveCSSOverride() {
        const overrideCSS = `
            /* HackerOne Color Replacer - Aggressive Override */
            * {
                --tw-bg-opacity: 1 !important;
            }
            
            /* Target all possible selectors */
            [style*="rgb(28 31 53"],
            [style*="rgb(38 43 68"],
            [style*="28 31 53"],
            [style*="38 43 68"],
            [style*="#262b44"],
            [style*="#1C1F35"],
            [style*="#1c1f35"] {
                background-color: #161616 !important;
                background: #161616 !important;
                color: #161616 !important;
            }
            
            /* Target common classes */
            .bg-slate-700,
            .bg-slate-800,
            .bg-gray-700,
            .bg-gray-800,
            .bg-zinc-700,
            .bg-zinc-800,
            .bg-neutral-700,
            .bg-neutral-800 {
                background-color: #161616 !important;
                background: #161616 !important;
            }
            
            /* Target report links */
            .report-to-link.text-black {
                color: #ffffff !important;
            }
            
            /* Target by computed color values */
            div[style*="background-color: rgb(28, 31, 53)"],
            div[style*="background-color: rgb(38, 43, 68)"],
            div[style*="background-color:#262b44"],
            div[style*="background-color:#1c1f35"],
            div[style*="background-color: #262b44"],
            div[style*="background-color: #1c1f35"] {
                background-color: #161616 !important;
                background: #161616 !important;
            }
            
            /* Override specific HackerOne elements */
            .report-card,
            .report-item,
            .bg-slate-800,
            .bg-slate-700,
            [class*="bg-slate-7"],
            [class*="bg-slate-8"],
            [class*="bg-gray-7"],
            [class*="bg-gray-8"] {
                background-color: #161616 !important;
                background: #161616 !important;
            }
            
            /* Force override for any remaining purple */
            *[style*="rgb(28"],
            *[style*="rgb(38"] {
                background-color: #161616 !important;
                background: #161616 !important;
            }
        `;
        
        let overrideStyle = document.getElementById('hackerone-aggressive-override');
        if (!overrideStyle) {
            overrideStyle = document.createElement('style');
            overrideStyle.id = 'hackerone-aggressive-override';
            overrideStyle.textContent = overrideCSS;
            document.head.appendChild(overrideStyle);
        }
    }

    // Main function to apply all replacements
    function applyAllReplacements() {
        try {
            // Process DOM content
            if (document.body) {
                processTextNodes(document.body);
            }
            
            // Process all elements aggressively
            processAllElements();
            
            // Process stylesheets
            processStylesheets();
            
            // Add aggressive CSS override
            addAggressiveCSSOverride();
            
        } catch (e) {
            console.log('Error in aggressive color replacer:', e);
        }
    }

    // Function to start the extension
    function startExtension() {
        if (!isEnabled) return;
        
        applyAllReplacements();
        
        // Start mutation observer
        if (observer) {
            observer.disconnect();
        }
        
        observer = new MutationObserver(function(mutations) {
            if (!isEnabled) return;
            
            let hasChanges = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            processTextNodes(node);
                            // Force style override for new elements
                            if (node.querySelectorAll) {
                                const newElements = node.querySelectorAll('*');
                                newElements.forEach(forceStyleOverride);
                            }
                            forceStyleOverride(node);
                            hasChanges = true;
                        }
                    });
                } else if (mutation.type === 'attributes') {
                    const element = mutation.target;
                    if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                        if (element.style && element.style.cssText) {
                            const originalStyle = element.style.cssText;
                            const modifiedStyle = replaceColors(originalStyle);
                            if (originalStyle !== modifiedStyle) {
                                try {
                                    element.style.cssText = modifiedStyle;
                                } catch (e) {
                                    // Ignore errors
                                }
                            }
                        }
                        forceStyleOverride(element);
                        hasChanges = true;
                    }
                }
            });
            
            if (hasChanges) {
                // Debounce the aggressive override
                clearTimeout(window.aggressiveColorTimeout);
                window.aggressiveColorTimeout = setTimeout(addAggressiveCSSOverride, 50);
            }
        });

        // Start observing
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }

        // Setup periodic cleanup
        const mainInterval = setInterval(() => {
            if (isEnabled) {
                applyAllReplacements();
            }
        }, 1000);
        intervals.push(mainInterval);
        
        // Setup event listeners
        ['scroll', 'resize', 'focus', 'click'].forEach(event => {
            const handler = () => {
                if (isEnabled) {
                    clearTimeout(window.eventColorTimeout);
                    window.eventColorTimeout = setTimeout(addAggressiveCSSOverride, 100);
                }
            };
            window.addEventListener(event, handler);
            eventListeners.push({ event, handler });
        });
    }
    
    // Function to stop the extension
    function stopExtension() {
        // Clear intervals
        intervals.forEach(clearInterval);
        intervals = [];
        
        // Remove event listeners
        eventListeners.forEach(({ event, handler }) => {
            window.removeEventListener(event, handler);
        });
        eventListeners = [];
        
        // Disconnect observer
        if (observer) {
            observer.disconnect();
        }
        
        // Remove CSS override
        const overrideStyle = document.getElementById('hackerone-aggressive-override');
        if (overrideStyle) {
            overrideStyle.remove();
        }
        
        // Clear timeouts
        clearTimeout(window.aggressiveColorTimeout);
        clearTimeout(window.eventColorTimeout);
    }
    
    // Function to initialize the extension
    function initialize() {
        // Check enabled state from storage
        chrome.storage.sync.get(['enabled'], function(result) {
            isEnabled = result.enabled !== false; // Default to true if not set
            
            if (isEnabled) {
                startExtension();
            }
        });
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateState') {
            isEnabled = request.enabled;
            
            if (isEnabled) {
                startExtension();
            } else {
                stopExtension();
            }
            
            sendResponse({ success: true });
        }
    });

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    console.log('HackerOne Aggressive Color Replacer loaded');
})(); 
