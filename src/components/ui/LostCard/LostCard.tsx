import "./LostCard.css";

import { useNavigate } from "react-router-dom";

import emptyImage from "../../../assets/icons/placeholders/image-placeholder.svg";
import { LostItem } from "../../../types/lost";

interface LostCardProps {
  item: LostItem;
}

const LostCard = ({
  item,
}: LostCardProps) => {

  const navigate = useNavigate();

  return (
    <div
      className="lost-card"
      onClick={() => navigate(`/lost/${item.id}`)}
    >

      <div className="lost-card-image-wrapper">
        <img
          className={`lost-card-image ${
            item.image === emptyImage ? "placeholder" : "uploaded"
          }`}
          src={item.image}
          alt={item.title}
        />
      </div>

      <div className="lost-card-content">

        <div className="lost-card-top">

          <span className="caption05 lost-card-category">
            {item.category}
          </span>

          <span className="caption05 lost-card-time">
            {item.time}
          </span>

        </div>

        <h2 className="body04 lost-card-title">
          {item.title}
        </h2>

        <div className="lost-card-body">

          <p className="body07 lost-card-description">
            {item.description}
          </p>

          <div className="lost-card-info">

            <span className="caption05 lost-card-info-text">
              발견 위치 : {item.location}
            </span>

            <span className="caption05 lost-card-info-text">
              발견 날짜 : {item.date}
            </span>

            <div className="lost-card-status">

              <span className="caption05 lost-card-info-text">
                현재 상태 :
              </span>

              <img
                className="lost-card-status-icon"
                src={item.statusIcon}
                alt="상태"
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LostCard;
