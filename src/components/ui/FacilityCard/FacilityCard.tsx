import "./FacilityCard.css";

import { useNavigate } from "react-router-dom";

import emptyImage from "../../../assets/icons/placeholders/image-placeholder.svg";
import { FacilityItem } from "../../../types/facility";

interface FacilityCardProps {
  item: FacilityItem;
}

const FacilityCard = ({
  item,
}: FacilityCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="facility-card"
      onClick={() => navigate(`/facility/${item.id}`)}
    >
      <div className="facility-card-image-wrapper">
        <img
          className={`facility-card-image ${
            item.image !== emptyImage ? "uploaded" : "placeholder"
          }`}
          src={item.image}
          alt={item.title}
        />
      </div>

      <div className="facility-card-content">

        <h2 className="body04 facility-card-title">
          {item.title}
        </h2>

        <div className="facility-card-body">

          <p className="body07 facility-card-description">
            {item.description}
          </p>

          <div className="facility-card-info">

            <span className="caption05 facility-card-info-text">
              문의 위치 : {item.location}
            </span>

            <div className="facility-card-status">

              <span className="caption05 facility-card-info-text">
                현재 상태 :
              </span>

              <img
                className="facility-card-status-icon"
                src={item.statusIcon}
                alt="상태"
              />

            </div>

            <span className="caption05 facility-card-date">
              {item.date}
            </span>

          </div>

        </div>

      </div>
    </div>
  );
};

export default FacilityCard;
