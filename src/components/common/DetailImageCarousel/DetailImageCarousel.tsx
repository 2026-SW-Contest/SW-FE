import {
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import cameraIcon from "../../../assets/icons/placeholders/no-photo.svg";

import "./DetailImageCarousel.css";

interface DetailImageCarouselProps {
  images?: string[];
  title: string;
}

const EMPTY_IMAGES: string[] = [];

const DetailImageCarousel = ({
  images = EMPTY_IMAGES,
  title,
}: DetailImageCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const isMouseDraggingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [images]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = Math.min(Math.max(index, 0), images.length - 1);

    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    setCurrentIndex(
      Math.min(
        Math.round(track.scrollLeft / track.clientWidth),
        images.length - 1,
      ),
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = trackRef.current;
    if (!track || images.length < 2) return;

    isMouseDraggingRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = track.scrollLeft;
    setIsDragging(true);
    track.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMouseDraggingRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    track.scrollLeft =
      dragStartScrollLeftRef.current - (event.clientX - dragStartXRef.current);
  };

  const finishMouseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMouseDraggingRef.current) return;

    isMouseDraggingRef.current = false;
    setIsDragging(false);

    const track = trackRef.current;
    if (!track) return;

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    scrollToIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(currentIndex + 1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="detail-image-carousel-empty">
        <img src={cameraIcon} alt="" />
        <span className="body07">등록된 이미지가 없습니다.</span>
      </div>
    );
  }

  return (
    <div className="detail-image-carousel">
      <div
        ref={trackRef}
        className={`detail-image-carousel-track${
          images.length > 1 ? " scrollable" : ""
        }${isDragging ? " dragging" : ""}`}
        role="region"
        aria-label={`${title} 이미지 ${images.length}장`}
        tabIndex={images.length > 1 ? 0 : -1}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishMouseDrag}
        onPointerCancel={finishMouseDrag}
        onKeyDown={handleKeyDown}
      >
        {images.map((image, index) => (
          <img
            key={`${title}-${index}`}
            src={image}
            alt={`${title} ${index + 1}번째 이미지`}
            className="detail-image-carousel-image"
            draggable={false}
          />
        ))}
      </div>

      <div className="detail-image-carousel-count" aria-live="polite">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default DetailImageCarousel;
