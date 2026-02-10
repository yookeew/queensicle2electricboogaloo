function parseQueensBoard(imageData, gridSize = 7, threshold = 20) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = imageData;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const cellWidth = canvas.width / gridSize;
            const cellHeight = canvas.height / gridSize;

            function isBlack(r, g, b) {
                return r < 30 && g < 30 && b < 30;
            }

            // Sample each cell, skip black pixels
            const colors = [];
            for (let i = 0; i < gridSize; i++) {
                const row = [];
                for (let j = 0; j < gridSize; j++) {
                    const samples = [];
                    for (let sy = 0.3; sy <= 0.7; sy += 0.2) {
                        for (let sx = 0.3; sx <= 0.7; sx += 0.2) {
                            const x = Math.floor(j * cellWidth + cellWidth * sx);
                            const y = Math.floor(i * cellHeight + cellHeight * sy);
                            const pixel = ctx.getImageData(x, y, 1, 1).data;

                            if (!isBlack(pixel[0], pixel[1], pixel[2])) {
                                samples.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
                            }
                        }
                    }

                    // Average non-black samples
                    let r = 0, g = 0, b = 0;
                    samples.forEach(s => { r += s.r; g += s.g; b += s.b; });
                    r = Math.round(r / samples.length);
                    g = Math.round(g / samples.length);
                    b = Math.round(b / samples.length);

                    row.push({ r, g, b });
                }
                colors.push(row);
            }

            // Cluster similar colors
            const colorClusters = [];

            function colorDistance(c1, c2) {
                return Math.sqrt(
                    Math.pow(c1.r - c2.r, 2) +
                    Math.pow(c1.g - c2.g, 2) +
                    Math.pow(c1.b - c2.b, 2)
                );
            }

            colors.forEach((row, i) => {
                row.forEach((color, j) => {
                    let clusterId = -1;
                    for (let k = 0; k < colorClusters.length; k++) {
                        if (colorDistance(color, colorClusters[k]) < threshold) {
                            clusterId = k;
                            break;
                        }
                    }

                    if (clusterId === -1) {
                        colorClusters.push(color);
                        clusterId = colorClusters.length - 1;
                    }

                    colors[i][j].clusterId = clusterId;
                });
            });

            const board = colors.map(row => row.map(cell => cell.clusterId));

            console.log('Detected', colorClusters.length, 'unique colors');
            console.log('Color clusters:', colorClusters);

            resolve(board);
        };
    });
}