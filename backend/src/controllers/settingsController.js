const { query } = require('../models/db');

// Allowlisted setting keys that administrators may update via the API.
const ALLOWED_SETTING_KEYS = new Set([
  'site_name',
  'site_tagline',
  'logo_url',
  'favicon_url',
  'footer_description',
  'hero_headline',
  'hero_subhead',
  'hero_image',
  'featured_section_heading',
  'trending_section_heading',
  'editorial_section_heading',
  'social_media_links',
  'contact_email',
  'contact_phone',
  'contact_address',
  'affiliate_disclosure',
  'seo_default_title',
  'seo_default_description',
  'curated_pieces_count',
  'aesthetics_count',
  'amazon_verified',
]);

const settingsController = {
  // GET all settings (public)
  async getAll(req, res) {
    const result = await query('SELECT * FROM settings ORDER BY setting_key ASC');
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  },

  // GET single setting (public)
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

    if (!ALLOWED_SETTING_KEYS.has(key)) {
      return res.status(403).json({ error: 'Setting key is not updatable via API' });
    }

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
