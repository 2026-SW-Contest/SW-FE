import "./LostPreviewCard.css";

import emptyPicture from "../../../assets/icons/placeholders/image-placeholder.svg";

import { useNavigate } from "react-router-dom";

import { LostItem } from "../../../types/lost";

interface LostPreviewCardProps {
  items: LostItem[];
}

const LostPreviewCard = ({
  items,
}: LostPreviewCardProps) => {

  const navigate = useNavigate();

  return (
    <div className="lost-preview">

      {items.map((item) => (
        <div
          key={item.id}
          className="lost-preview-item"
          onClick={() => navigate(`/lost/${item.id}`)}
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
