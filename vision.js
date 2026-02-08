function parseQueensBoard(imageData, gridSize = 7, area = null) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = imageData;

        img.onload = () => {
            // If area specified, crop to that area
            if (area) {
                canvas.width = area.width;
                canvas.height = area.height;
                ctx.drawImage(img, area.left, area.top, area.width, area.height, 0, 0, area.width, area.height);
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            }

            const cellWidth = canvas.width / gridSize;
            const cellHeight = canvas.height / gridSize;

            const board = [];
            const colorToRegion = new Map();
            let regionId = 0;

            for (let i = 0; i < gridSize; i++) {
                const row = [];
                for (let j = 0; j < gridSize; j++) {
                    const x = Math.floor(j * cellWidth + cellWidth / 2);
                    const y = Math.floor(i * cellHeight + cellHeight / 2);

                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    const colorKey = `${pixel[0]},${pixel[1]},${pixel[2]}`;

                    if (!colorToRegion.has(colorKey)) {
                        colorToRegion.set(colorKey, regionId++);
                    }

                    row.push(colorToRegion.get(colorKey));
                }
                board.push(row);
            }

            resolve(board);
        };
    });
}