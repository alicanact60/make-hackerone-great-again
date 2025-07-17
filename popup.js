// HackerOne Color Replacer Popup Script
document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusDiv = document.getElementById('statusDiv');
    const statusText = document.getElementById('statusText');
    const reloadNotice = document.getElementById('reloadNotice');
    
    // Load current state from storage
    chrome.storage.sync.get(['enabled'], function(result) {
        const isEnabled = result.enabled !== false; // Default to true if not set
        updateUI(isEnabled);
    });
    
    // Toggle switch event handler
    toggleSwitch.addEventListener('click', function() {
        const isCurrentlyEnabled = toggleSwitch.classList.contains('active');
        const newState = !isCurrentlyEnabled;
        
        // Save new state to storage
        chrome.storage.sync.set({ enabled: newState }, function() {
            updateUI(newState);
            showReloadNotice();
            
            // Send message to content script to update state
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const currentTab = tabs[0];
                if (currentTab && currentTab.url.includes('hackerone.com')) {
                    chrome.tabs.sendMessage(currentTab.id, { 
                        action: 'updateState', 
                        enabled: newState 
                    });
                }
            });
        });
    });
    
    // Update UI based on state
    function updateUI(isEnabled) {
        if (isEnabled) {
            toggleSwitch.classList.add('active');
            statusDiv.classList.remove('disabled');
            statusDiv.classList.add('enabled');
            statusText.textContent = 'Active - Colors are being replaced';
        } else {
            toggleSwitch.classList.remove('active');
            statusDiv.classList.remove('enabled');
            statusDiv.classList.add('disabled');
            statusText.textContent = 'Inactive - Colors are not being replaced';
        }
    }
    
    // Show reload notice
    function showReloadNotice() {
        reloadNotice.style.display = 'block';
        setTimeout(function() {
            reloadNotice.style.display = 'none';
        }, 3000);
    }
    
    // Check if we're on HackerOne and show appropriate message
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        if (currentTab && !currentTab.url.includes('hackerone.com')) {
            statusText.textContent = 'This extension only works on HackerOne';
            statusDiv.classList.add('disabled');
            toggleSwitch.style.opacity = '0.5';
            toggleSwitch.style.pointerEvents = 'none';
        }
    });
}); 