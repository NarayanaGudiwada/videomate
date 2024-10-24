import React, { useCallback } from 'react';
import { Play, Pause, ArrowLeft, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import TimelineProgressor from './timeline-progressor';

interface TimelineElement {
  id: string;
  type: string;
  startTime: number;
  duration: number;
  zIndex?: number;
  keyframes?: Record<string, Record<string, number | string>>;
  [key: string]: unknown; // For other properties that might vary based on element type
}

interface TimelineProps {
  elements: TimelineElement[];
  selectedElement: TimelineElement | null;
  currentTime: number;
  isPlaying: boolean;
  setSelectedElement: (element: TimelineElement | null) => void;
  setCurrentTime: (time: number) => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
}

const Timeline: React.FC<TimelineProps> = ({
  elements,
  selectedElement,
  currentTime,
  isPlaying,
  setSelectedElement,
  setCurrentTime,
  playAnimation,
  pauseAnimation
}) => {
  const sortElementsByZIndex = (elements: TimelineElement[]) => {
    return [...elements].sort((a, b) => {
      if (a.zIndex !== undefined && b.zIndex !== undefined) {
        return a.zIndex - b.zIndex;
      }
      return elements.indexOf(a) - elements.indexOf(b);
    });
  };

  const interpolateProperties = useCallback((element: TimelineElement, time: number) => {
    if (!element.keyframes) return element;

    const keyframeTimes = Object.keys(element.keyframes)
      .map(Number)
      .sort((a, b) => a - b);

    if (keyframeTimes.length === 0) return element;

    const prevKeyframeTime = keyframeTimes.filter((t) => t <= time).pop() || keyframeTimes[0];
    const nextKeyframeTime = keyframeTimes.find((t) => t > time) || keyframeTimes[keyframeTimes.length - 1];

    if (prevKeyframeTime === nextKeyframeTime) {
      return { ...element, ...element.keyframes[prevKeyframeTime] };
    }

    const progress = (time - prevKeyframeTime) / (nextKeyframeTime - prevKeyframeTime);
    const prevProps = element.keyframes[prevKeyframeTime];
    const nextProps = element.keyframes[nextKeyframeTime];

    const interpolatedProps = Object.keys(prevProps).reduce((acc, prop) => {
      if (typeof prevProps[prop] === 'number' && typeof nextProps[prop] === 'number') {
        acc[prop] = prevProps[prop] + (nextProps[prop] - prevProps[prop]) * progress;
      } else {
        acc[prop] = prevProps[prop];
      }
      return acc;
    }, {} as Record<string, any>);

    return { ...element, ...interpolatedProps };
  }, []);

  return (
    <div className="fixed bottom-0 left-[45px] right-0 h-64 bg-background overflow-hidden border-t border-border">
      <div className="flex items-center space-x-2 mb-2 p-4">
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={isPlaying ? pauseAnimation : playAnimation}
            className="bg-primary hover:bg-primary/80 text-white">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentTime(0)}
            className="bg-primary hover:bg-primary/80 text-white">
            <ArrowLeft size={20} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="bg-primary hover:bg-primary/80 text-white"
            onClick={() => setCurrentTime(Math.max(0, currentTime - 1))}>
            <Rewind size={20} />
          </Button>
          <div className="bg-secondary rounded px-2 py-1 text-sm font-medium">
            {currentTime.toFixed(2)}
          </div>
        </div>
      </div>
      <ScrollArea className="h-40">
        <div className="relative h-40 bg-background border">
          <div className="absolute top-0 left-24 right-0 h-6 flex items-end border-b">
            {[...Array(121)].map((_, i) => (
              <React.Fragment key={i}>
                {i % 10 === 0 ? (
                  <span
                    className="absolute text-xs text-muted-foreground"
                    style={{ left: `${i * (100 / 120)}%` }}>
                    {i / 10}s
                  </span>
                ) : (
                  <div
                    className="absolute w-0.5 h-0.5 bg-muted-foreground rounded-full"
                    style={{ left: `${i * (100 / 120)}%`, bottom: '4px' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <ScrollArea className="absolute top-6 left-0 right-0 bottom-0 w-full">
            <div className="relative p-2">
              {sortElementsByZIndex(elements)
                .reverse()
                .map((el, index) => (
                  <div
                    key={el.id}
                    className="h-8 relative flex items-center hover:bg-accent/50 mb-1">
                    <Badge variant="outline" className="absolute left-0 justify-start">
                      Track {sortElementsByZIndex(elements).length - index}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute h-6 left-24 rounded-md cursor-pointer ${
                              selectedElement && selectedElement.id === el.id
                                ? 'bg-primary'
                                : 'bg-secondary'
                            }`}
                            style={{
                              width: `${(el.duration / 10) * 100}%`
                            }}
                            onClick={() => setSelectedElement(el)}>
                            <div
                              className={`h-full flex items-center justify-center text-xs font-medium truncate px-1 ${
                                selectedElement && selectedElement.id === el.id
                                  ? 'text-primary-foreground'
                                  : 'text-secondary-foreground'
                              }`}>
                              {(el.type || 'Element').charAt(0).toUpperCase() + (el.type || 'Element').slice(1)}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{el.type}</p>
                          <p>Start: {el.startTime}s</p>
                          <p>Duration: {el.duration}s</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {Object.entries(el.keyframes || {}).map(([time, props]) => (
                      <TooltipProvider key={time}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute w-2 h-2 bg-destructive rounded-full cursor-pointer"
                              style={{
                                left: `calc(40px + ${(parseFloat(time) / 10) * 100}%)`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }}
                              onClick={() => {
                                setSelectedElement(el);
                                setCurrentTime(parseFloat(time));
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Keyframe at {time}s</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
            </div>
          </ScrollArea>
          <TimelineProgressor className="absolute top-0 left-20" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Timeline;
