export const randomString = (length: number) => {
  let r = '';
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < length; i++)
    r += charset.charAt(Math.floor(Math.random() * charset.length));

  return r;
};
