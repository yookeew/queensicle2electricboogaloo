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

const quotes = [
  "Be the storm they never saw coming 🌪️⚡",
  "Born alpha, raised sigma 🐺🔥",
  "Lead with silence 🔇, dominate with action 💪",
  "The alpha leads👑. The sigma doesn’t follow 🚷",
  "Roar in silence 🐅",
  "Strength isn’t loud. It’s precise 🎯🧠",
  "An alpha with a sigma mindset 🧠",
  "I lead alone, I win alone 🏆",
  "Strength is built in solitude 🏋️‍♂️",
  "Be the weapon they never see 🗡️",
  "Silent kings rule the loudest empires 👑🤐",
  "Kill doubt with discipline 💀📈",
  "I fear nothing because I’ve faced everything 🧱🔥",
  "I don’t talk power—I show it 🎬💥",
  "Walk like you’re untouchable 🚶‍♂️🛡️",
  "Ruthless when necessary 🩸⚔️",
  "Confidence without a crowd 😌🚫",
  "Be silent🤫, be deadly ☠️",
  "Respect is silent, just like me 🤐👑",
  "Leadership is born from within 🧠🔥",
  "When I move, the world notices 🌍⚡",
  "Learn the art of silence and watch your power grow 🎨📈",
  "Alpha by action. Sigma by mindset 🐺⚙️",
  "The throne is mine because I built it 🪑🔨",
  "Watch the lone wolf rise 🐺",
  "No crowd, just the crown 👑🚫",
  "The wolf🐺 doesn’t concern himself with sheep 🐑",
  "I don’t raise my voice—I raise my standards 📏🔥",
  "Be undeniable in your silence 🤐💎",
  "Focused. Fearless. Forged in solitude 🔥⚒️",
  "I became what they feared 😈",
  "No followers. Only legends 🏆🗿",
  "Quietly becoming unstoppable 🚀",
  "I earn my place every day 🧱📅",
  "Power isn’t given—it’s taken ⚡",
  "Never loud. Always legendary 🏛️🔥",
  "Let your actions speak a language of dominance 🗣️"
];
const quotesEl = document.getElementById('quotes');
const quoteBtn = document.getElementById('quoteBtn');

let clickCount = 0;

quoteBtn.addEventListener('click', () => {
    document.getElementById('quotes').textContent = `"${getRandomQuote()}"`;

    clickCount++;
    if(clickCount === 1) quoteBtn.textContent = "Not enough!";
    else if(clickCount === 2) quoteBtn.textContent = "MOREE";
    else quoteBtn.textContent = "RARGHHHH";
});

function getRandomQuote() {
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
