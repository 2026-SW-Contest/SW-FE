import "./PreviewCard.css";

import { PreviewItem } from "../../../types/preview";

interface PreviewCardProps {
  items: PreviewItem[];
  actionLabel: string;

  onItemClick?: (item: PreviewItem) => void;
  onViewAll?: () => void;
}

const PreviewCard = ({
  items,
  actionLabel,
  onItemClick,
  onViewAll,
}: PreviewCardProps) => {
  return (
    <div className="preview-card">
      <div className="preview-card-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="preview-card-item"
          >
            <span className="preview-card-title">
              {item.title}
            </span>

            <div className="preview-card-right">
              <span className="preview-card-time">
                {item.time}
              </span>

              <button
                type="button"
                className="preview-card-button"
                onClick={() => onItemClick?.(item)}
              >
                {actionLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="preview-card-more"
        onClick={onViewAll}
      >
        전체 보기 &gt;
      </button>
    </div>
  );
};

export default PreviewCard;