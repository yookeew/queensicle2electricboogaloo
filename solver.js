function solveQueens(board) {
    // board is 2D array of region IDs
    const n = board.length;
    const solution = Array(n).fill().map(() => Array(n).fill(0));

    function isValid(row, col) {
        // Check row
        for (let j = 0; j < n; j++) {
            if (solution[row][j] === 1) return false;
        }

        // Check column
        for (let i = 0; i < n; i++) {
            if (solution[i][col] === 1) return false;
        }

        // Check no touching (8 neighbors)
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                const ni = row + di;
                const nj = col + dj;
                if (ni >= 0 && ni < n && nj >= 0 && nj < n) {
                    if (solution[ni][nj] === 1) return false;
                }
            }
        }

        // Check region (only one queen per region)
        const region = board[row][col];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (board[i][j] === region && solution[i][j] === 1) {
                    return false;
                }
            }
        }

        return true;
    }

    function backtrack(row) {
        if (row === n) return true; // All queens placed

        for (let col = 0; col < n; col++) {
            if (isValid(row, col)) {
                solution[row][col] = 1;
                if (backtrack(row + 1)) return true;
                solution[row][col] = 0; // Backtrack
            }
        }
        return false;
    }

    if (backtrack(0)) {
        // Extract coordinates
        const coords = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (solution[i][j] === 1) {
                    coords.push([i, j]);
                }
            }
        }
        return coords;
    }
    return null;
}