export const useTimelineSnap = (snapInterval: number = 0.1) => {
  const snapToGrid = (time: number): number => {
    return Math.round(time / snapInterval) * snapInterval;
  };

  const snapElement = (element: TimelineElement): TimelineElement => {
    return {
      ...element,
      startTime: snapToGrid(element.startTime),
      duration: snapToGrid(element.duration)
    };
  };

  return { snapToGrid, snapElement };
};
