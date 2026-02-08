document.getElementById('threshold').addEventListener('input', (e) => {
    document.getElementById('thresholdVal').textContent = e.target.value;
});

document.getElementById('solveBtn').addEventListener('click', async () => {
    const gridSize = parseInt(document.getElementById('gridSize').value);
    const threshold = parseInt(document.getElementById('threshold').value);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['vision.js', 'solver.js']
    });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (size, thresh) => {
            window.queensConfig = { gridSize: size, threshold: thresh };
        },
        args: [gridSize, threshold]
    });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});