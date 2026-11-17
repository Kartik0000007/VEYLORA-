const { query } = require('../models/db');

const settingsController = {
  // GET all settings
  async getAll(req, res) {
    const result = await query('SELECT * FROM settings ORDER BY setting_key ASC');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  },

  // GET single setting
  async getByKey(req, res) {
    const { key } = req.params;
    const result = await query('SELECT * FROM settings WHERE setting_key = $1', [key]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(result.rows[0]);
  },

  // UPDATE setting (admin)
  async update(req, res) {
    const { key } = req.params;
    const { setting_value } = req.body;

    if (setting_value === undefined) {
      return res.status(400).json({ error: 'setting_value is required' });
    }

    const result = await query(
      `INSERT INTO settings (setting_key, setting_value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, setting_value]
    );
    res.json(result.rows[0]);
  },
};

module.exports = settingsController;
