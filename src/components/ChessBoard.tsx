import React, { useState } from 'react';
import { initializeBoard } from '../utils';
import { Piece, Board, CheckStatusType, GameStatusType, HistoryType } from '../types';
import "./chessboard.scss";
import useChessBoardHook from '../hooks/useChessBoardHook';

// Map piece types to their Unicode symbols
const pieceSymbols: { [key in Piece['type']]: string } = {
  king: "♔",    // White King
  queen: "♕",   // White Queen
  rook: "♖",    // White Rook
  bishop: "♗",  // White Bishop
  knight: "♘",  // White Knight
  pawn: "♙",    // White Pawn
};

// Map colors to their corresponding piece types
const blackPieceSymbols: { [key in Piece['type']]: string } = {
  king: "♚",    // Black King
  queen: "♛",   // Black Queen
  rook: "♜",    // Black Rook
  bishop: "♝",  // Black Bishop
  knight: "♞",  // Black Knight
  pawn: "♟️",    // Black Pawn
};
const initialGameStatus: GameStatusType = {
  checkStatus: {
    white: {
      isChecked: false,
      isCheckMate: false
    },
    black: {
      isChecked: false,
      isCheckMate: false
    }
  },
  kingPosition: {
    white: [7, 4],
    black: [0, 4],
  }
}

const ChessBoard: React.FC = () => {
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [gameStatus, setGameStatus] = useState<GameStatusType>(initialGameStatus);
  const [history, setHistory] = useState<HistoryType[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const { handleSquareClick } = useChessBoardHook({ board, setBoard, selectedPiece, gameStatus, setGameStatus, setSelectedPiece, currentPlayer, setCurrentPlayer })

  return (
    <div className="chess-board">
      {board.map((row: (Piece | null)[], rowIndex: number) => (
        <div key={rowIndex} className="board-row">
          {row.map((piece: Piece | null, colIndex: number) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${((rowIndex + colIndex) % 2 === 0) ? 'white' : 'black'} ${selectedPiece?.position[0] === rowIndex && selectedPiece?.position[1] === colIndex && "selected-square"}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <span className={`piece`}>
                  {piece.color === 'black' ? blackPieceSymbols[piece.type] : pieceSymbols[piece.type]}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;
