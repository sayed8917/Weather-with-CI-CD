const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 1500;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query param: q' });

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const results = (data.results || []).map((r) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
    }));
    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach geocoding service' });
  }
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Missing params: lat, lon' });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}`
    + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl'
    + '&hourly=temperature_2m,weather_code'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max'
    + '&timezone=auto&forecast_days=7';

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Bad forecast response');
    res.json(await resp.json());
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach weather service' });
  }
});

app.listen(PORT, () => {
  console.log(`Weather app running on port ${PORT}`);
});