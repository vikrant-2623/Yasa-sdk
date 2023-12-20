import { StudentCard } from '../../student-card';
import './index.css';
import { useRef, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { CarouselRef } from 'antd/lib/carousel';
import { observer } from 'mobx-react';
import { useStore } from '@proctor/infra/hooks/ui-store';
import { VideosWallLayoutEnum } from '@proctor/infra/stores/common/type';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { AgoraCarousel } from '@proctor/infra/capabilities/components/carousel';

export const AllVideos = observer(() => {
  const {
    usersUIStore: {
      studentListByUserUuidPrefix,
      filterTag,
      videosWallLayout,
      studentListByPage,
      currentUserCount,
    },
  } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerRect, setContainerRect] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setContainerRect({
      width: containerRef.current?.clientWidth || 0,
      height: containerRef.current?.clientHeight || 0,
    });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const handleResize = debounce(() => {
    setContainerRect({
      width: containerRef.current?.clientWidth || 0,
      height: containerRef.current?.clientHeight || 0,
    });
  }, 25);
  const onWheel = debounce((e) => {
    if (e.deltaY > 0) {
      next();
    } else if (e.deltaY < 0) {
      prev();
    }
  }, 20);
  const afterCarouselChange = (currentSlide: number) => {
    setCurrentPage(currentSlide);
  };
  const prev = () => {
    if (!carouselRef.current) return;

    carouselRef.current.prev();
  };
  const next = () => {
    if (!carouselRef.current) return;

    carouselRef.current.next();
  };
  return (
    <div className="fcr-all-videos-tab" ref={containerRef}>
      {studentListByUserUuidPrefix(filterTag).size > 0 ? (
        <>
          {studentListByUserUuidPrefix(filterTag).size > videosWallLayout && (
            <div className="fcr-all-videos-tab-controller">
              <div className="fcr-all-videos-tab-controller-prev" onClick={prev}>
                <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_UP}></SvgImg>
              </div>
              <div className="fcr-all-videos-tab-controller-info">
                <span>{currentUserCount}</span>
                <span>/</span>
                <span>{studentListByUserUuidPrefix(filterTag).size}</span>
              </div>
              <div className="fcr-all-videos-tab-controller-next" onClick={next}>
                <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_DOWN}></SvgImg>
              </div>
            </div>
          )}
          <div className="fcr-all-videos-tab-page" onWheel={onWheel}>
            <AgoraCarousel
              initialSlide={0}
              dots={false}
              ref={carouselRef}
              vertical
              verticalSwiping
              infinite={false}
              lazyLoad="ondemand"
              afterChange={afterCarouselChange}>
              {studentListByPage.reduce((prev, cur, index) => {
                return prev.concat(
                  <div key={index}>
                    <div
                      className={`fcr-all-videos-tab-page-item fcr-all-videos-tab-page-item-${VideosWallLayoutEnum[
                        videosWallLayout
                      ].toLowerCase()}`}
                      style={{ ...containerRect }}>
                      {cur.map((userUuidPrefix) => {
                        return (
                          <StudentCard
                            key={userUuidPrefix}
                            renderVideos={index === currentPage}
                            userUuidPrefix={userUuidPrefix}></StudentCard>
                        );
                      })}
                    </div>
                  </div>,
                );
              }, [] as JSX.Element[])}
            </AgoraCarousel>
          </div>
        </>
      ) : (
        <div className="fcr-all-videos-empty">
          <img
            src={require('@proctor/infra/capabilities/containers/common/waiting.png')}
            width={256}
          />
        </div>
      )}
    </div>
  );
});
