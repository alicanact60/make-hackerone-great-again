# HackerOne Color Replacer Chrome Extension

This Chrome extension automatically replaces specific colors on HackerOne (hackerone.com) pages with a custom color (#161616).

## What it does

The extension performs the following replacements on all HackerOne responses:

1. **Regex replacement**: Replaces these color patterns with `#161616`:
   - `rgb(28 31 53 / var(--tw-bg-opacity, 1))`
   - `rgb(28 31 53 / var(--tw-bg-opacity))`
   - `rgb(38 43 68 / var(--tw-bg-opacity))`
   - `#262b44`

2. **String replacement**: Replaces `#1C1F35` with `#161616`

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension will be automatically loaded and active on HackerOne

## Usage

- Click the extension icon in the Chrome toolbar to open the popup
- Use the toggle switch to enable/disable the color replacements
- The extension will remember your preference
- When disabled, no color replacements will be applied
- When enabled, all specified colors will be replaced with #161616

## Files

- `manifest.json` - Chrome extension manifest file
- `content.js` - Content script that performs the color replacements
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and toggle logic
- `README.md` - This documentation

## How it works

The extension:
- Runs only on HackerOne domains (*.hackerone.com)
- Monitors the page for changes using MutationObserver
- Applies color replacements to:
  - Text content
  - CSS styles
  - Inline styles
  - Dynamically loaded content

## Technical Details

- Uses Manifest V3 for Chrome extensions
- Runs at document_end to ensure the page is ready
- Continuously monitors for DOM changes to handle dynamic content
- Applies replacements every 2 seconds as a fallback

## Permissions

The extension only requires:
- `activeTab` permission
- `storage` permission (to remember your enable/disable preference)
- Access to `*.hackerone.com` domains

No data is collected or transmitted by this extension. The storage permission is only used to save your toggle preference locally. 

Feedback: https://x.com/alicanact60