import api from './api';

let cached = null;

export function getCatalog() {
  if (!cached) {
    cached = api
      .get('/interviews/roles')
      .then(res => res.data.data)
      .catch(err => {
        cached = null;
        throw err;
      });
  }
  return cached;
}
