import "./FacilityPreviewCard.css";

import emptyPicture from "../../../assets/icons/common/empty-picture.svg";

import { FacilityItem } from "../../../types/facility";

interface FacilityPreviewCardProps {
  items: FacilityItem[];
}

const FacilityPreviewCard = ({
  items,
}: FacilityPreviewCardProps) => {
  return (
    <div className="facility-preview">

      {items.map((item) => (

        <div
          key={item.id}
          className="facility-preview-item"
        >

          <div className="facility-preview-image">

            <img
              src={item.image || emptyPicture}
              alt={item.title}
            />

          </div>

          <div className="facility-preview-content">

            <h3 className="body04 facility-preview-title">
              {item.title}
            </h3>

            <p className="body07 facility-preview-description">
              {item.description}
            </p>

            <span className="caption05 facility-preview-date">
              {item.date}
            </span>

          </div>

        </div>

      ))}

    </div>
  );
};

export default FacilityPreviewCard;