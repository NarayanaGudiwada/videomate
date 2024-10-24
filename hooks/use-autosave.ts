import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutosave<T>(
  data: T,
  onSave: (data: T) => void,
  delay: number = 1000
) {
  const saveRef = useRef(
    debounce((data: T) => {
      onSave(data);
    }, delay)
  );

  useEffect(() => {
    saveRef.current(data);
  }, [data]);
}
