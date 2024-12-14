// Define types for piece and color
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type Color = 'white' | 'black';

export type GameStatusType = {
    checkStatus: {
        white: {
            isChecked: boolean,
            isCheckMate: boolean
        },
        black: {
            isChecked: boolean,
            isCheckMate: boolean
        }
    },
    kingPosition: {
        white: [number, number],
        black: [number, number]
    }
}

export type HistoryType = {
    startPosition: [number, number],
    endPosition: [number, number],
    specialRule: string
}
export interface Piece {
    type: PieceType;
    color: Color;
    position: [number, number],
    isMoved: boolean;
}

// Define the board as an 8x8 grid with optional pieces (null for empty squares)
export type Board = (Piece | null)[][];

export type PieceValidationReturnType = {
    isValid: boolean,
    errorMessage: string,
    extraMoves?: { currentPosition: [number, number], newPosition: [number, number] }[];  // Optional key that holds an array of all different moves
}

export type ValidationFunction = (piece: Piece, targetPosition: [number, number], board: Board) => PieceValidationReturnType;

export interface UseChessBoardHookProps {
    board: Board;
    gameStatus: GameStatusType;
    setGameStatus: React.Dispatch<React.SetStateAction<GameStatusType>>;
    setBoard: React.Dispatch<React.SetStateAction<Board>>;
    selectedPiece: Piece | null;
    setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>;
    currentPlayer: 'white' | 'black';
    setCurrentPlayer: React.Dispatch<React.SetStateAction<'white' | 'black'>>;
}