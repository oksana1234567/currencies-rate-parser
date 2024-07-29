export const sleep = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
      clearTimeout(timeout);
    }, ms);
  });
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await sleep(2000);
    }
  }
  throw new Error('Max retries exceeded');
};
