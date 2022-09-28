/**
 * 用于解决 hook 下 setInterval 闭包导致 state 变量不变的问题
 * 参考实现:
 * @see https://github.com/Hermanya/use-interval
 * @see https://overreacted.io/zh-hans/making-setinterval-declarative-with-react-hooks/
 */
import { useEffect, useRef } from 'react';

/* istanbul ignore next */
/** keep typescript happy */
const noop = () => {};

function useInterval(
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean
) {
  const savedCallback = useRef(noop);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Execute callback if immediate is set.
  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
  }, [delay, immediate]);

  // Set up the interval.
  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default useInterval;
