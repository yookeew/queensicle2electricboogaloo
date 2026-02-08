console.log('Content script loaded!');

// Prevent multiple injections
if (window.queensSolverLoaded) {
    console.log('Already loaded, skipping');
} else {
    window.queensSolverLoaded = true;
    
    function selectArea() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.3);z-index:999999;cursor:crosshair';
            overlay.innerHTML = '<div style="color:white;text-align:center;margin-top:20px;font-size:20px;user-select:none;">Click and drag to select the puzzle board</div>';
            let startX, startY;
            let selectionBox = null;
            
            overlay.addEventListener('mousedown', (e) => {
                startX = e.clientX;
                startY = e.clientY;
                
                selectionBox = document.createElement('div');
                selectionBox.style.cssText = 'position:fixed;border:2px solid red;background:rgba(255,0,0,0.1);z-index:1000000;pointer-events:none';
                document.body.appendChild(selectionBox);
            });
            
            overlay.addEventListener('mousemove', (e) => {
                if (selectionBox) {
                    const currentX = e.clientX;
                    const currentY = e.clientY;
                    
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
                const endX = e.clientX;
                const endY = e.clientY;
                
                overlay.remove();
                if (selectionBox) selectionBox.remove();
                
                const left = Math.min(startX, endX);
                const top = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);
                
                resolve({ left, top, width, height });
            });
            
            document.body.appendChild(overlay);
        });
    }

    async function solvePuzzle() {
        console.log('solvePuzzle started');
        
        const area = await selectArea();
        console.log('Selected area:', area);
        
        // Request screenshot from background
        chrome.runtime.sendMessage({ action: 'capture' }, async (response) => {
            console.log('Screenshot received');
            
            const board = await parseQueensBoard(response.imageData, 7, area);
            console.log('Parsed board:', board);
            
            const solution = solveQueens(board);
            console.log('Solution:', solution);
            
            alert('Solution: ' + JSON.stringify(solution));
        });
    }

    solvePuzzle();
}