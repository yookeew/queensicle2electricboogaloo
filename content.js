(function() {
    console.log('Content script loaded!');

    const config = window.queensConfig || { gridSize: null, threshold: 20 };

    function detectBoard() {
        const board = document.querySelector('.board');
        if (!board) return null;

        const gridCols = getComputedStyle(board).gridTemplateColumns;
        const gridSize = gridCols.trim().split(/\s+/).length;

        const rect = board.getBoundingClientRect();
        const area = {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };

        console.log('Auto-detected board:', area, 'Grid size:', gridSize);
        return { area, gridSize };
    }

    function selectArea() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);z-index:999999;cursor:crosshair';
            overlay.innerHTML = '<div style="color:white;text-align:center;margin-top:20px;font-size:20px;user-select:none;">Click and drag to select the puzzle board</div>';

            let startX, startY;
            let selectionBox = null;

            overlay.addEventListener('mousedown', (e) => {
                startX = e.pageX;
                startY = e.pageY;

                selectionBox = document.createElement('div');
                selectionBox.style.cssText = 'position:absolute;border:2px solid red;background:rgba(255,0,0,0.1);z-index:1000000;pointer-events:none';
                overlay.appendChild(selectionBox);
            });

            overlay.addEventListener('mousemove', (e) => {
                if (selectionBox) {
                    const currentX = e.pageX;
                    const currentY = e.pageY;

                    const left = Math.min(startX, currentX);
                    const top = Math.min(startY, currentY);
                    const width = Math.abs(currentX - startX);
                    const height = Math.abs(currentY - startY);

                    selectionBox.style.left = left + 'px';
                    selectionBox.style.top = top + 'px';
                    selectionBox.style.width = width + 'px';
                    selectionBox.style.height = height + 'px';
                }
            });

            overlay.addEventListener('mouseup', (e) => {
                const endX = e.pageX;
                const endY = e.pageY;

                overlay.remove();

                const left = Math.min(startX, endX);
                const top = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);

                resolve({ left, top, width, height });
            });

            document.body.appendChild(overlay);
        });
    }

    function cropToSelection(imageData, area) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const dpr = window.devicePixelRatio || 1;
                const scrollX = window.scrollX;
                const scrollY = window.scrollY;

                const sx = (area.left - scrollX) * dpr;
                const sy = (area.top - scrollY) * dpr;
                const sw = area.width * dpr;
                const sh = area.height * dpr;

                const canvas = document.createElement('canvas');
                canvas.width = sw;
                canvas.height = sh;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

                resolve(canvas.toDataURL());
            };
            img.src = imageData;
        });
    }

    /**
    function clickSolution(solution, area, gridSize) {
        const cellWidth = area.width / gridSize;
        const cellHeight = area.height / gridSize;

        solution.forEach(([row, col], index) => {
            setTimeout(() => {
                const x = area.left + col * cellWidth + cellWidth / 2;
                const y = area.top + row * cellHeight + cellHeight / 2;

                const element = document.elementFromPoint(x - window.scrollX, y - window.scrollY);
                if (element) {
                    element.click();
                    console.log(`Clicked cell (${row}, ${col}) at position (${x}, ${y})`);
                }
            }, index * 1000);
        });
    }**/

    function isPurple(r, g, b) {
        const targetR = 114;
        const targetG = 77;
        const targetB = 151;
        const buffer = 10;

        return Math.abs(r - targetR) <= buffer &&
               Math.abs(g - targetG) <= buffer &&
               Math.abs(b - targetB) <= buffer;
    }

    function checkForWin(area, gridSize) {
        const cellWidth = area.width / gridSize;
        const cellHeight = area.height / gridSize;

        const checkCells = [[1, 1], [2, 3], [3, 4]];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
                const img = new Image();
                img.onload = () => {
                    const dpr = window.devicePixelRatio || 1;
                    const scrollX = window.scrollX;
                    const scrollY = window.scrollY;

                    canvas.width = area.width * dpr;
                    canvas.height = area.height * dpr;

                    const sx = (area.left - scrollX) * dpr;
                    const sy = (area.top - scrollY) * dpr;

                    ctx.drawImage(img, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

                    for (const [row, col] of checkCells) {
                        const x = Math.floor((col * cellWidth + cellWidth / 2) * dpr);
                        const y = Math.floor((row * cellHeight + cellHeight / 2) * dpr);

                        const pixel = ctx.getImageData(x, y, 1, 1).data;
                        if (isPurple(pixel[0], pixel[1], pixel[2])) {
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                };
                img.src = response.imageData;
            });
        });
    }

    function showSolutionOverlay(solution, area, gridSize) {
        const cellWidth = area.width / gridSize;
        const cellHeight = area.height / gridSize;

        const overlay = document.createElement('div');
        overlay.id = 'queens-solution-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999998;';
        document.body.appendChild(overlay);

        solution.forEach(([row, col]) => {
            const x = area.left + col * cellWidth + cellWidth / 2;
            const y = area.top + row * cellHeight + cellHeight / 2;

            const circle = document.createElement('div');
            circle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${Math.min(cellWidth, cellHeight) * 0.8}px;
                height: ${Math.min(cellWidth, cellHeight) * 0.8}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                border: 3px solid white;
                transform: translate(-50%, -50%);
                pointer-events: none;
            `;
            overlay.appendChild(circle);
        });

        const dismissBtn = document.createElement('button');
        dismissBtn.textContent = 'Clear Solution';
        dismissBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999999;
            padding: 12px 20px;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            pointer-events: auto;
        `;

        const cleanup = () => {
            overlay.remove();
            dismissBtn.remove();
            clearInterval(winCheckInterval);
        };

        dismissBtn.onclick = cleanup;
        document.body.appendChild(dismissBtn);

        const winCheckInterval = setInterval(async () => {
            const won = await checkForWin(area, gridSize);
            if (won) {
                console.log('Player won! Clearing overlay.');
                cleanup();
            }
        }, 200);
    }

    async function solvePuzzle() {
        const existingOverlay = document.getElementById('queens-solution-overlay');
        if (existingOverlay) existingOverlay.remove();

        const existingBtns = document.querySelectorAll('button');
        existingBtns.forEach(btn => {
            if (btn.textContent === 'Clear Solution') btn.remove();
        });

        console.log('solvePuzzle started');
        console.log('Config:', config);

        let boardData = detectBoard();
        let area, gridSize;

        if (boardData) {
            area = boardData.area;
            gridSize = boardData.gridSize;
            console.log('Using auto-detected board');
        } else {
            console.log('Board not found, asking user to select manually');
            area = await selectArea();
            gridSize = config.gridSize || 7;
            console.log('Manual selection:', area);
        }

        chrome.runtime.sendMessage({ action: 'capture' }, async (response) => {
            console.log('Screenshot received');

            const cropped = await cropToSelection(response.imageData, area);
            console.log('Cropped');

            const board = await parseQueensBoard(cropped, gridSize, config.threshold);
            console.log('Parsed board:', board);

            const solution = solveQueens(board);
            console.log('Solution:', solution);

            if (solution) {
                showSolutionOverlay(solution, area, gridSize);
            } else {
                alert('No solution found! Try lowering color threshold?');
            }
        });
    }

    solvePuzzle();
})();