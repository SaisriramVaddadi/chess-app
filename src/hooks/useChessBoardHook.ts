import { Board, Piece, CheckStatusType, PieceValidationReturnType, UseChessBoardHookProps, ValidationFunction } from '../types'; // Ensure this path matches your project structure
import { validatePawnMove, validateForUnkownChecksBeforeMove, validateKnightMove, validateBishopMove, validateRookMove, validateQueenMove, validateKingMove, validateEnemyCheckAfterMove } from '../rulesEngine/ruleConfigs';

// Define a type for piece validation functions


const useChessBoardHook = ({
  board,
  setBoard,
  selectedPiece,
  setSelectedPiece,
  gameStatus,
  setGameStatus,
  currentPlayer,
  setCurrentPlayer,
}: UseChessBoardHookProps) => {

  // Map piece types to their validation functions
  const pieceValidationMap: Record<string, ValidationFunction> = {
    pawn: validatePawnMove,
    knight: validateKnightMove,
    bishop: validateBishopMove,
    rook: validateRookMove,
    queen: validateQueenMove,
    king: validateKingMove,
  };

  // Validate move for a piece
  const validateMove = (piece: Piece, targetPosition: [number, number], board: Board): PieceValidationReturnType => {

    // Run piece-specific validation
    const isValidPieceMove = pieceValidationMap[piece.type]?.(piece, targetPosition, board);
    return isValidPieceMove;
  };

  const updateBoardState = (newBoard: Board) => {
    setBoard(newBoard); // Update board state
    setSelectedPiece(null); // Deselect the piece
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white'); // Switch turn
  }

  // Handle square click event
  const handleSquareClick = (rowIndex: number, colIndex: number) => {
    const targetSquarePiece = board[rowIndex][colIndex];
    /* validate if
     1. if selceted piece is there.
     2. if user clicks on same square
     3. if target Square is not occupied by same colored piece.
    */

    if (
      selectedPiece &&
      !(rowIndex === selectedPiece.position[0] && colIndex === selectedPiece.position[1]) &&
      selectedPiece.color !== targetSquarePiece?.color
    ) {
      const targetPosition: [number, number] = [rowIndex, colIndex];
      const newBoard = board.map((row) => [...row]); // Create a deep copy of the board
      const isValidMove = validateMove(selectedPiece, targetPosition, board);
      if (!isValidMove.isValid) {
        alert(isValidMove.errorMessage);
        return;
      };
      if (isValidMove.isValid) {
        if (selectedPiece.type === "king") {
          setGameStatus(prev => ({ ...prev, kingPosition: { ...prev.kingPosition, [selectedPiece.color]: [rowIndex, colIndex] } }))
        }
        if (isValidMove.extraMoves?.length) {
          isValidMove.extraMoves.forEach(({ currentPosition, newPosition }) => {
            const currentPiece = newBoard[currentPosition[0]][currentPosition[1]];
            if (currentPiece) {
              currentPiece.isMoved = true;
              currentPiece.position = newPosition;
              newBoard[currentPosition[0]][currentPosition[1]] = null;
              newBoard[newPosition[0]][newPosition[1]] = currentPiece;
            }
          })
        }
        newBoard[selectedPiece.position[0]][selectedPiece.position[1]] = null; // Remove piece from old position
        newBoard[rowIndex][colIndex] = { ...selectedPiece, position: targetPosition, isMoved: true }; // Place piece in new position

        // Check for existing check condition
        const isPresentKingSafe = validateForUnkownChecksBeforeMove(selectedPiece, newBoard, gameStatus);
        if (!isPresentKingSafe.isValid) {
          alert(isPresentKingSafe.errorMessage);
          return false;
        }
        const isEnemyKingSafe = validateEnemyCheckAfterMove(selectedPiece, newBoard, gameStatus);
        if (!isEnemyKingSafe.isValid) {
          setGameStatus(prev => ({ ...prev, checkStatus: { ...prev.checkStatus, [selectedPiece.color === "black" ? "white" : "black"]: { isChecked: true, isCheckMate: false } } }));
        }
        updateBoardState(newBoard);
      }
    } else {
      // check if the same player trying to move again.
      if (targetSquarePiece && targetSquarePiece.color === currentPlayer) {
        setSelectedPiece(targetSquarePiece);
      } else {
        alert(`${currentPlayer} needs to move.`);
      }
    }
  };

  return {
    handleSquareClick,
  };
};

export default useChessBoardHook;
