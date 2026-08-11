import "./FacilityPreviewCard.css";

import emptyPicture from "../../../assets/icons/placeholders/image-placeholder.svg";

import { FacilityItem } from "../../../types/facility";

import { useNavigate } from "react-router-dom";

interface FacilityPreviewCardProps {
  items: FacilityItem[];
}

const FacilityPreviewCard = ({
  items,
}: FacilityPreviewCardProps) => {
  
  const navigate = useNavigate();
  
  return (
    <div className="facility-preview">

      {items.map((item) => (

        <div
          key={item.id}
          className="facility-preview-item"
          onClick={() => navigate(`/facility/${item.id}`)}
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
