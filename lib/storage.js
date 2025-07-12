import { put, get } from '@vercel/blob';

export const storage = {
  put: async (filename, stream, options) => {
    const blob = await put(filename, stream, options);
    return blob;
  },
  get: async (url) => {
    const response = await fetch(url);
    return {
      url,
      contentType: response.headers.get('content-type'),
      body: response.body
    };
  }
};
