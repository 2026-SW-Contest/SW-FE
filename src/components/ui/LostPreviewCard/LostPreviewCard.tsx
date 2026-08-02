import "./LostPreviewCard.css";

import emptyPicture from "../../../assets/icons/common/empty-picture.svg";

import { PreviewItem } from "../../../types/preview";

interface LostPreviewCardProps {
  items: PreviewItem[];
}

const LostPreviewCard = ({
  items,
}: LostPreviewCardProps) => {
  return (
    <div className="lost-preview">

      {items.map((item) => (
        <div
          key={item.id}
          className="lost-preview-item"
        >

          <div className="lost-preview-image">

            <img
              src={item.image || emptyPicture}
              alt={item.title}
            />

          </div>

          <div className="lost-preview-text">

            <p className="body05 lost-preview-title">
              {item.title}
            </p>

            <p className="body07 lost-preview-description">
              {item.description}
            </p>

          </div>

        </div>
      ))}

    </div>
  );
};

export default LostPreviewCard;