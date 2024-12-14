
import { Board, Piece } from "./types";
// Function to initialize the board
export const initializeBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null)); // Create an empty 8x8 board

  // First two rows: Black pieces
  const blackBackRow: Piece[] = [
    { type: 'rook', color: 'black', position: [0, 0], isMoved: false },
    { type: 'knight', color: 'black', position: [0, 1], isMoved: false },
    { type: 'bishop', color: 'black', position: [0, 2], isMoved: false },
    { type: 'queen', color: 'black', position: [0, 3], isMoved: false },
    { type: 'king', color: 'black', position: [0, 4], isMoved: false },
    { type: 'bishop', color: 'black', position: [0, 5], isMoved: false },
    { type: 'knight', color: 'black', position: [0, 6], isMoved: false },
    { type: 'rook', color: 'black', position: [0, 7], isMoved: false },
  ];

  const blackPawnRow: Piece[] = Array(8).fill(null).map((_, index) => ({
    type: 'pawn',
    color: 'black',
    position: [1, index],
    isMoved: false
  }));

  // Last two rows: White pieces
  const whiteBackRow: Piece[] = [
    { type: 'rook', color: 'white', position: [7, 0], isMoved: false },
    { type: 'knight', color: 'white', position: [7, 1], isMoved: false },
    { type: 'bishop', color: 'white', position: [7, 2], isMoved: false },
    { type: 'queen', color: 'white', position: [7, 3], isMoved: false },
    { type: 'king', color: 'white', position: [7, 4], isMoved: false },
    { type: 'bishop', color: 'white', position: [7, 5], isMoved: false },
    { type: 'knight', color: 'white', position: [7, 6], isMoved: false },
    { type: 'rook', color: 'white', position: [7, 7], isMoved: false },
  ];

  const whitePawnRow: Piece[] = Array(8).fill(null).map((_, index) => ({
    type: 'pawn',
    color: 'white',
    position: [6, index],
    isMoved: false
  }));

  // Place pieces on the board
  board[0] = blackBackRow;
  board[1] = blackPawnRow;
  board[6] = whitePawnRow;
  board[7] = whiteBackRow;

  return board;
};


