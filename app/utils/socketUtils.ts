const withTimeout = (
  onSuccess: { apply: (thisArg: undefined, arg1: unknown[]) => void },
  onTimeout: () => void,
  timeout: number
) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args: unknown[]) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  };
};

export default withTimeout;
