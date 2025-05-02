interface RatingDisplayProps {
  rating: number;
  feedback?: string | null;
  className?: string;
}

const RatingDisplay = ({ rating, feedback, className = "" }: RatingDisplayProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xl ${
              i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {feedback && (
        <p className="text-sm text-gray-600">{feedback}</p>
      )}
    </div>
  );
};

export default RatingDisplay; 