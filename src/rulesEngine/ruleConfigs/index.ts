import { Piece, Board, PieceValidationReturnType, GameStatusType } from "../../types";
import { pawnMovementRules, knightMovementRules, kingMovementRules } from "./movementRules";

const isKingSafe = (
    kingPosition: [number, number],
    color: string,
    board: Board
): PieceValidationReturnType => {
    const [kingRow, kingCol] = kingPosition;

    const enemyColor = color === "white" ? "black" : "white";

    // Helper to check if a position is within bounds
    const isValidPosition = (row: number, col: number): boolean =>
        row >= 0 && row < board.length && col >= 0 && col < board[0].length;

    // Offset definitions
    const offsets = {
        pawn: enemyColor === "white"
            ? [[1, -1], [1, 1]] // Black pawns attack diagonally down
            : [[-1, -1], [-1, 1]], // White pawns attack diagonally up
        knight: [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ],
        sliding: [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Rook directions (straight)
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Bishop directions (diagonals)
        ],
        king: [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ]
    };

    // Check threats based on offsets
    for (const [rowOffset, colOffset] of offsets.pawn) {
        const row = kingRow + rowOffset;
        const col = kingCol + colOffset;
        if (isValidPosition(row, col) && board[row][col]?.type === "pawn" && board[row][col]?.color === enemyColor) {
            return { isValid: false, errorMessage: "King is threatened by a pawn" };
        }
    }

    for (const [rowOffset, colOffset] of offsets.knight) {
        const row = kingRow + rowOffset;
        const col = kingCol + colOffset;
        if (isValidPosition(row, col) && board[row][col]?.type === "knight" && board[row][col]?.color === enemyColor) {
            return { isValid: false, errorMessage: "King is threatened by a knight" };
        }
    }

    for (const [rowStep, colStep] of offsets.sliding) {
        let currentRow = kingRow + rowStep;
        let currentCol = kingCol + colStep;

        while (isValidPosition(currentRow, currentCol)) {
            const piece = board[currentRow][currentCol];
            if (piece) {
                if (
                    piece.color === enemyColor &&
                    (piece.type === "rook" || piece.type === "bishop" || piece.type === "queen")
                ) {
                    return { isValid: false, errorMessage: "King is threatened by a sliding piece" };
                }
                break; // Blocked by another piece
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
    }

    for (const [rowOffset, colOffset] of offsets.king) {
        const row = kingRow + rowOffset;
        const col = kingCol + colOffset;
        if (isValidPosition(row, col) && board[row][col]?.type === "king" && board[row][col]?.color === enemyColor) {
            return { isValid: false, errorMessage: "King is threatened by an enemy king" }; // King is threatened by an enemy king
        }
    }
    console.log("new board", board);
    return { isValid: true, errorMessage: "" }; // King is safe
};

const validateForUnkownChecksBeforeMove = (piece: Piece, board: Board, gameStatus: GameStatusType): PieceValidationReturnType => {
    // check if already check is there.

    console.log(gameStatus.checkStatus, board);
    if (!gameStatus.checkStatus[piece.color]) {
        return { isValid: false, errorMessage: "Resolve existing check." };
    }
    // find If there is any check for the existing king.
    const isKingSafeValidator = isKingSafe(gameStatus.kingPosition[piece.color], piece.color, board);
    return isKingSafeValidator;
};

const validateEnemyCheckAfterMove = (piece: Piece, board: Board, gameStatus: GameStatusType) => {
    //check for enemy check after current color move.
    const enemyColor = piece.color === "white" ? "black" : "white";
    const isEnemyKingSafe = isKingSafe(gameStatus.kingPosition[enemyColor], enemyColor, board);
    return isEnemyKingSafe;
};

const isPathBlocked = (
    start: [number, number],
    end: [number, number],
    board: Board
): boolean => {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    // Calculate step direction for traversal
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff); // 1, -1, or 0
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff); // 1, -1, or 0

    let currentRow = startRow + stepRow;
    let currentCol = startCol + stepCol;

    // Traverse the path until reaching the target position
    while (currentRow !== endRow || currentCol !== endCol) {
        if (board[currentRow][currentCol]) {
            console.log(`Path is blocked at [${currentRow}, ${currentCol}].`);
            return true;
        }

        currentRow += stepRow;
        currentCol += stepCol;
    }

    return false; // Path is clear
};

const isPathClearForCastling = (
    board: Board,
    kingPosition: [number, number],
    rookPosition: [number, number],
    direction: "left" | "right",
    color: 'white' | 'black'
): PieceValidationReturnType => {
    const [kingRow, kingCol] = kingPosition;
    const [rookRow, rookCol] = rookPosition;

    // Ensure King and Rook are on the same row
    if (kingRow !== rookRow) {
        return { isValid: false, errorMessage: "The King and Rook are not on the same row for castling." };
    }

    // Ensure the King and Rook are of the same color
    if (board[kingRow][kingCol]?.color !== color || board[rookRow][rookCol]?.color !== color) {
        return { isValid: false, errorMessage: "The King and Rook must be of the same color." };
    }

    // Check the path for the King (from current position to the castling position)
    const pathForKing = direction === "left"
        ? [kingCol - 1, kingCol - 2]
        : [kingCol + 1, kingCol + 2];

    for (const col of pathForKing) {
        if (board[kingRow][col]) { // If there's a piece blocking the path
            // Check if the piece blocking the path is of the same color as the King
            if (board[kingRow][col]?.color === color) {
                return { isValid: false, errorMessage: `Path blocked by a ${board[kingRow][col].type} of same color.` };
            } else {
                return { isValid: false, errorMessage: `Path blocked by an opponent's ${board[kingRow][col].type}.` };
            }
        }
    }

    // Check the path for the Rook (between the Rook and the King)
    const pathForRook = direction === "left"
        ? [1, 2, 3] // Queen-side castling
        : [5, 6];   // King-side castling
    for (const col of pathForRook) {
        if (board[rookRow][col]) { // If there's a piece blocking the path
            // Check if the piece blocking the path is of the same color as the Rook
            if (board[rookRow][col]?.color === color) {
                console.error(`Rook's path blocked by a piece of the same color at ${rookRow}, ${col}`);
                return { isValid: false, errorMessage: `Rook's path blocked by a same color's ${board[rookRow][col].type}` };
            } else {
                console.error(`Rook's path blocked by an opponent's piece at ${rookRow}, ${col}`);
                return { isValid: false, errorMessage: `Rook's path blocked by a opponent's ${board[rookRow][col].type}` };
            }
        }
    }

    return { isValid: true, errorMessage: "" };
};

const canKingCastle = (piece: Piece, board: Board,
    isQueenSideCastle: boolean): PieceValidationReturnType => {

    //0. check if king has moved already.
    if (piece.isMoved) {
        return { isValid: false, errorMessage: "King has already moved" };
    }
    const targetRookPosition: [number, number] = [piece.color === "white" ? 7 : 0, isQueenSideCastle ? 0 : 7];
    const currentPieceInTargetRookPosition = board[targetRookPosition[0]][targetRookPosition[1]];
    console.log(targetRookPosition, currentPieceInTargetRookPosition, board);
    //1. check if no piece is there in target rook position.
    if (!currentPieceInTargetRookPosition) {
        return { isValid: false, errorMessage: "No piece in target rook position" };
    }
    //2. check if target rook position has different color piece.
    if (currentPieceInTargetRookPosition && (currentPieceInTargetRookPosition.color !== piece.color)) {
        return { isValid: false, errorMessage: "target rook position has different color piece" };
    }
    //3. check if target rook position has rook.
    if (currentPieceInTargetRookPosition && currentPieceInTargetRookPosition.type !== "rook") {
        return { isValid: false, errorMessage: "rook is not there at the end." };
    }
    //4. check if target rook position has rook and hasnt moved already.
    if (currentPieceInTargetRookPosition && currentPieceInTargetRookPosition.type === "rook" && currentPieceInTargetRookPosition.isMoved) {
        return { isValid: false, errorMessage: "Rook has already moved." };
    }
    //5. if all above conditions passed check for path clearance now.
    const isPathClear = isPathClearForCastling(board, piece.position, targetRookPosition, isQueenSideCastle ? "left" : "right", piece.color);
    return isPathClear;
}

/* ********** validation moves for all pieces. ************** */

const validatePawnMove = (
    piece: Piece,
    targetPosition: [number, number],
    board: Board
): { isValid: boolean; errorMessage: string } => {
    const { directions, conditions } = pawnMovementRules;

    const [currentRow, currentCol] = piece.position;
    const [targetRow, targetCol] = targetPosition;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns

    // Adjust directions for black pawns (reverse x-axis movement)
    const adjustedDirections = piece.color === 'white'
        ? directions.map((dir) => ({ ...dir, x: -dir.x })) // Flip row direction for black
        : directions; // Keep directions as is for white

    // Step 1: Check move direction validity
    const moveDirection = adjustedDirections.find((dir) => dir.x === dx && dir.y === dy);
    if (!moveDirection) {
        return { isValid: false, errorMessage: "Invalid move direction for the pawn." };
    }

    // Step 2: Validate move type (move vs capture)
    const targetPiece = board[targetRow]?.[targetCol];
    const isCapture = targetPiece && targetPiece.color !== piece.color;

    if (moveDirection.type === "move" && isCapture) {
        return { isValid: false, errorMessage: "Pawns cannot capture on a forward move." };
    }
    if (moveDirection.type === "capture" && !isCapture) {
        return { isValid: false, errorMessage: "Pawns can only capture diagonally." };
    }

    // Step 3: Check for first-move double step
    if (
        conditions.firstMoveDoubleStep &&
        Math.abs(dx) === 2 &&
        (piece.color === 'white' ? currentRow !== 6 : currentRow !== 1)
    ) {
        return { isValid: false, errorMessage: "Pawns can only move two squares forward on their first move." };
    }

    // Step 5: Check for blocked path (only for forward moves)
    if (conditions.blockedPath && moveDirection.type === "move") {
        // Ensure all squares in the path are empty
        const steps = Math.abs(dx);
        for (let step = 1; step <= steps; step++) {
            const intermediateRow = currentRow + step * (piece.color === 'white' ? -1 : 1);
            if (board[intermediateRow]?.[currentCol]) {
                return { isValid: false, errorMessage: "Pawns cannot move through other pieces." };
            }
        }
    }

    // Step 4: Validate promotion (if applicable)
    if (
        conditions.promotion &&
        ((piece.color === 'white' && targetRow === 0) || (piece.color === 'black' && targetRow === 7))
    ) {
        // Promotion logic can be handled separately
        console.log("Pawn promotion is required.");
    }

    // Step 5: En passant (if applicable)
    if (conditions.enPassant) {
        // En passant logic can be added here if needed
        console.log("En passant validation is not implemented yet.");
    }

    return { isValid: true, errorMessage: "" };
};

const validateKnightMove = (piece: Piece, targetPosition: [number, number]): PieceValidationReturnType => {
    const { directions } = knightMovementRules;
    const [targetRow, targetCol] = targetPosition;
    const [currentRow, currentCol] = piece.position;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns

    // Step 1: Check move direction validity
    const moveDirection = directions.find((dir) => dir.x === dx && dir.y === dy);
    if (!moveDirection) {
        return { isValid: false, errorMessage: "Invalid move direction for the knight." };
    }

    return { isValid: true, errorMessage: "" };

}

const validateBishopMove = (piece: Piece, targetPosition: [number, number], board: Board): PieceValidationReturnType => {
    const [targetRow, targetCol] = targetPosition;
    const [currentRow, currentCol] = piece.position;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns

    if (Math.abs(dx) !== Math.abs(dy)) {
        return { isValid: false, errorMessage: "Invalid move: Bishop can only move diagonally." }
    }

    // Check if the path is blocked
    if (isPathBlocked(piece.position, targetPosition, board)) {
        return { isValid: false, errorMessage: "Invalid move: path is blocked." };
    }

    return { isValid: true, errorMessage: "" };
};

const validateRookMove = (piece: Piece, targetPosition: [number, number], board: Board): PieceValidationReturnType => {

    const [targetRow, targetCol] = targetPosition;
    const [currentRow, currentCol] = piece.position;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns

    // 1. check for direction.
    if (dx !== 0 && dy !== 0) {
        return { isValid: false, errorMessage: "Invalid move: Rook can only move in straight line." };
    }
    //2. Check if the path is blocked
    if (isPathBlocked(piece.position, targetPosition, board)) {
        return { isValid: false, errorMessage: "Invalid move: path is blocked." };
    }

    //3. check for castling condition.
    return { isValid: true, errorMessage: "" };
}

const validateQueenMove = (piece: Piece, targetPosition: [number, number], board: Board): PieceValidationReturnType => {
    const [targetRow, targetCol] = targetPosition;
    const [currentRow, currentCol] = piece.position;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns

    // 1. check if row diff and col diff are not equal or both row diff and col diff are  not zero.
    if (!(Math.abs(dx) === Math.abs(dy) || (dx === 0 || dy === 0))) {
        return { isValid: false, errorMessage: "Invalid move: Queen can only move straight/diagonal." }
    }

    // 2. check for blocked path
    if (isPathBlocked(piece.position, targetPosition, board)) {
        return { isValid: false, errorMessage: "Invalid move: path is blocked." };
    }

    return { isValid: true, errorMessage: "" }
}

const validateKingMove = (piece: Piece, targetPosition: [number, number], board: Board): PieceValidationReturnType => {

    const { directions } = kingMovementRules;
    const [targetRow, targetCol] = targetPosition;
    const [currentRow, currentCol] = piece.position;

    const dx = targetRow - currentRow; // Difference in rows
    const dy = targetCol - currentCol; // Difference in columns
    // Step 1: Check move direction validity
    const moveDirection = directions.find((dir) => dir.x === Math.abs(dx) && dir.y === Math.abs(dy));
    if (!moveDirection) {
        return { isValid: false, errorMessage: "Invalid move direction for the king." };
    }

    //step 2. check for castling.

    if (Math.abs(dx) === 0 && Math.abs(dy) === 2) {
        let isQueenSideCastle = false;
        if ((piece.color === "white" && dy < 0) || (piece.color === "black" && dy > 0)) {
            isQueenSideCastle = true;
        }
        const isCastleValid = canKingCastle(piece, board, isQueenSideCastle);
        if (!isCastleValid.isValid) {
            return { isValid: false, errorMessage: isCastleValid.errorMessage };
        }
        let currentRookPosition: [number, number];
        let targetRookPosition: [number, number];

        if (piece.color === "black" && isQueenSideCastle) {
            currentRookPosition = [0, 0];
            targetRookPosition = [0, 3];
        }
        else if (piece.color === "black" && !isQueenSideCastle) {
            currentRookPosition = [0, 7];
            targetRookPosition = [0, 5];
        }
        else if (piece.color === "white" && isQueenSideCastle) {
            currentRookPosition = [7, 0];
            targetRookPosition = [7, 3];
        }
        else {
            currentRookPosition = [7, 7];
            targetRookPosition = [7, 5];
        }
        return { ...isCastleValid, extraMoves: [{ currentPosition: currentRookPosition, newPosition: targetRookPosition }] }
    }
    //send rooks current position and target position as well.
    return { isValid: true, errorMessage: "" };
}


export { validateForUnkownChecksBeforeMove, validateEnemyCheckAfterMove, validatePawnMove, validateKnightMove, validateBishopMove, validateRookMove, validateQueenMove, validateKingMove };
