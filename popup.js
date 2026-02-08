document.getElementById('solveBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject scripts
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['vision.js', 'solver.js', 'content.js']
    });
});