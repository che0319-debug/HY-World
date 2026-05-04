// Render API client
console.log('[API] api.js loaded');
const API_BASE   = 'https://telegram-bot-t82n.onrender.com';
const API_SECRET = '950157secret';

const API = {
  _get(path) {
    const url = API_BASE + path;
    console.log('[API] fetch →', url);
    return fetch(url, {
      method: 'GET',
      headers: { 'X-Secret': API_SECRET },
      cache: 'no-store',
    })
    .then(function(r) {
      console.log('[API] status', r.status, url);
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
      return r.json();
    })
    .then(function(data) {
      console.log('[API] data ←', url, data);
      return data;
    })
    .catch(function(err) {
      console.error('[API] ERROR', url, err.message || err);
      throw err;   // re-throw so scene .catch() can set error flag
    });
  },

  overview()       { return this._get('/api/overview');        },
  personal()       { return this._get('/api/personal-data');   },
  family()         { return this._get('/api/family-data');     },
  progress()       { return this._get('/api/progress');        },
  todaySchedule()  { return this._get('/api/today-schedule');  },
  familySchedule() { return this._get('/api/family-schedule'); },
  suggestHq()      { return this._get('/api/suggest-hy');      },
  suggestHome()    { return this._get('/api/suggest-home');    },
  suggestItri()    { return this._get('/api/suggest-itri');    },
};
