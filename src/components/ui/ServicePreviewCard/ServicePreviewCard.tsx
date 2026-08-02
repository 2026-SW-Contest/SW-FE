import "./ServicePreviewCard.css";

import emptyPicture from "../../../assets/icons/common/empty-picture.svg";
import { PreviewItem } from "../../../types/preview";

interface ServicePreviewCardProps {
  items: PreviewItem[];
}

const ServicePreviewCard = ({
  items,
}: ServicePreviewCardProps) => {
  return (
    <div className="service-preview">
      {items.map((item) => (
        <div
          key={item.id}
          className="service-preview-item"
        >
          <div className="service-preview-image">
            <img
              src={item.image || emptyPicture}
              alt={item.title}
            />
          </div>

          <div className="service-preview-content">
            <h3 className="body04 service-preview-title">
              {item.title}
            </h3>

            <p className="body07 service-preview-description">
              {item.description}
            </p>

            <span className="caption05 service-preview-date">
              {item.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicePreviewCard;