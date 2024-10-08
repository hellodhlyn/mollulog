type EditTierProps = {
  initialTier: number;
  currentTier: number;
  onUpdate: (tier: number) => void;
};

export default function EditTier(
  { initialTier, currentTier, onUpdate }: EditTierProps,
) {
  return (
    <div className="text-2xl font-light group">
      <div className="text-yellow-500 inline-block mr-2">
        {[1, 2, 3, 4, 5].map((position) => (
          <span
            key={`tier-${position}`}
            className={`cursor-pointer hover:text-yellow-600 transition ${(currentTier < position) ? "opacity-50 group-hover:opacity-100" : ""}`}
            onClick={() => { if (position >= initialTier) { onUpdate(position); } }}
          >
            {currentTier >= position ? "★" : "☆"}
          </span>
        ))}
      </div>
      <div className="text-teal-500 inline-block">
        {[6, 7, 8].map((position) => (
          <span
            key={`tier-${position}`}
            className={`cursor-pointer hover:text-teal-600 transition ${(currentTier < position) && "opacity-50 group-hover:opacity-100"}`}
            onClick={() => { onUpdate(position); }}
          >
            {currentTier >= position ? "★" : "☆"}
          </span>
        ))}
      </div>
    </div>
  )
}
