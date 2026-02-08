chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'capture') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            sendResponse({ imageData: dataUrl });
        });
        return true;
    }
});