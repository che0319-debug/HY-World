// Render API client — expanded in Task 12
const API_BASE = 'https://telegram-bot-t82n.onrender.com';
const API_SECRET = '950157secret';

const API = {
  _get(path) {
    return fetch(API_BASE + path, {
      headers: { 'X-Secret': API_SECRET }
    }).then(r => r.json());
  },
  overview()    { return this._get('/api/overview'); },
  personal()    { return this._get('/api/personal-data'); },
  family()      { return this._get('/api/family-data'); },
  progress()    { return this._get('/api/progress'); }
};
