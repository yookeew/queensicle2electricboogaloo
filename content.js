// 0=purple, 1=blue, 2=orange, 3=green, 4=gray, 5=dark blue, 6=red, 7=yellow
//answer: (0,5), (1,2), (2,0), (3,3), (4,1), (5,4), (6,6)
const testBoard = [
    [0, 0, 0, 1, 3, 4, 4],
    [0, 1, 1, 1, 3, 4, 4],
    [0, 2, 2, 2, 3, 3, 4],
    [0, 2, 2, 3, 3, 4, 4],
    [0, 2, 2, 3, 3, 4, 4],
    [0, 0, 0, 3, 5, 4, 4],
    [5, 5, 5, 5, 5, 5, 6]
];

const solution = solveQueens(testBoard);
console.log('Solution:', solution);
alert('Solution: ' + JSON.stringify(solution));