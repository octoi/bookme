export const validateReqBody = (body: any, keys: string[]) => {
  return new Promise<void>((resolve, reject) => {
    for (let i = 0; i < keys.length; i++) {
      if (!body[keys[i]]) {
        reject(`${keys[i]} is not passed.`);
        return;
      }
    }

    resolve();
  });
};
