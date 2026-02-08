document.getElementById('solveBtn').addEventListener('click', async () => {
    console.log('Button clicked');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Tab:', tab);

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['vision.js', 'solver.js', 'content.js'] // Add vision.js here
    });

    console.log('Script injected');
});