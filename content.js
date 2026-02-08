console.log('Content script loaded!');

// Prevent multiple injections
if (window.queensSolverLoaded) {
    console.log('Already loaded, skipping');
} else {
    window.queensSolverLoaded = true;
    
    const config = window.queensConfig || { gridSize: 7, threshold: 40 };

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

    async function solvePuzzle() {
        console.log('solvePuzzle started');
        console.log('Config:', config);

        const area = await selectArea();
        console.log('Selected area:', area);

        chrome.runtime.sendMessage({ action: 'capture' }, async (response) => {
            console.log('Screenshot received');

            const cropped = await cropToSelection(response.imageData, area);
            console.log('Cropped');

            const board = await parseQueensBoard(cropped, config.gridSize, config.threshold);
            console.log('Parsed board:', board);

            const solution = solveQueens(board);
            console.log('Solution:', solution);

            alert('Solution: ' + JSON.stringify(solution));
        });
    }

    solvePuzzle();
}