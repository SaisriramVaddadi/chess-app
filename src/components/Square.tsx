// Define a type for the different piece types
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

// Define the pieceSymbols object with explicit typing
const pieceSymbols: Record<PieceType, string> = {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
};

// Define an interface for the piece prop
interface Piece {
    type: PieceType;
}

// Example usage in a functional component
const Square: React.FC<{ piece: Piece }> = ({ piece }) => (
    <div className="piece">
        {pieceSymbols[piece.type]}
    </div>
);

export default Square;
