const pawnMovementRules = {
    directions: [
        { x: 1, y: 0, type: "move" },    // Forward 1 step
        { x: 2, y: 0, type: "move" },    // Forward 2 steps (first move)
        { x: 1, y: 1, type: "capture" }, // Diagonal right for capture
        { x: 1, y: -1, type: "capture" }, // Diagonal left for capture
    ],
    conditions: {
        firstMoveDoubleStep: true,   // First move allows two squares forward
        blockedPath: true,           // Path must be clear
        enPassant: true,             // Allow en passant (optional advanced rule)
        promotion: true              // Promotion when reaching the last row
    },
};
const knightMovementRules = {
    directions: [
        { x: 2, y: 1, type: "move" },  // Move 2 steps horizontally, 1 step vertically
        { x: 2, y: -1, type: "move" }, // Move 2 steps horizontally, -1 step vertically
        { x: -2, y: 1, type: "move" }, // Move -2 steps horizontally, 1 step vertically
        { x: -2, y: -1, type: "move" }, // Move -2 steps horizontally, -1 step vertically
        { x: 1, y: 2, type: "move" },   // Move 1 step horizontally, 2 steps vertically
        { x: 1, y: -2, type: "move" },  // Move 1 step horizontally, -2 steps vertically
        { x: -1, y: 2, type: "move" },  // Move -1 step horizontally, 2 steps vertically
        { x: -1, y: -2, type: "move" }, // Move -1 step horizontally, -2 steps vertically
    ],
}

const bishopMovementRules = {
    directions: [
        { x: 1, y: 1, type: "move" },   // Diagonal up-right
        { x: 1, y: -1, type: "move" },  // Diagonal down-right
        { x: -1, y: 1, type: "move" },  // Diagonal up-left
        { x: -1, y: -1, type: "move" }, // Diagonal down-left
    ],
    conditions: {
        blockedPath: true,   // The bishop can't jump over pieces. Its path is blocked if something is in the way
        captureDiagonally: true,  // The bishop can only capture pieces on the diagonals
    }
}

const rookMovementRules = {
    directions: [
        { x: 1, y: 0 }, // Top
        { x: 0, y: 1 }, // Right
        { x: -1, y: 0 }, // Left
        { x: 0, y: -1 }, // Bottom
    ],
    condtions: {
        castling: true
    }
}

const queenMovementRules = {
    directions: [
        { x: 1, y: 0 }, // Top
        { x: 0, y: 1 }, // Right
        { x: -1, y: 0 }, // Left
        { x: 0, y: -1 }, // Bottom
        { x: 1, y: 1 },  // Top right diagonal
        { x: 1, y: -1 },  // Top left diagonal
        { x: -1, y: 1 },  // Bottom right diagonal
        { x: -1, y: -1 }, // Bottom left diagonal
    ]
}

const kingMovementRules = {
    directions: [
        { x: 1, y: 0 }, // Top
        { x: 0, y: 1 }, // Right
        { x: -1, y: 0 }, // Left
        {x: 0, y: -2 }, // left 2 steps
        { x: 0, y: 2}, //right 2 steps
        { x: 0, y: -1 }, // Bottom
        { x: 1, y: 1 },  // Top right diagonal
        { x: 1, y: -1 },  // Top left diagonal
        { x: -1, y: 1 },  // Bottom right diagonal
        { x: -1, y: -1 }, // Bottom left diagonal
    ],
    maxSteps: 1,
    conditions: {
        castling: true
    }

}

export { pawnMovementRules, knightMovementRules, bishopMovementRules, rookMovementRules, queenMovementRules, kingMovementRules }