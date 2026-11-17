const { query } = require('../models/db');

const categoryController = {
  // GET all categories
  async getAll(req, res) {
    const result = await query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC, name ASC'
    );
    res.json(result.rows);
  },

  // GET single category by slug
  async getBySlug(req, res) {
    const { slug } = req.params;
    const result = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  },

  // GET single category by id
  async getById(req, res) {
    const { id } = req.params;
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  },

  // CREATE category (admin)
  async create(req, res) {
    const { name, slug, description, image_url, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    try {
      const result = await query(
        `INSERT INTO categories (name, slug, description, image_url, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, slug, description || null, image_url || null, sort_order || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') { // unique violation
        return res.status(409).json({ error: 'Category slug already exists' });
      }
      throw err;
    }
  },

  // UPDATE category (admin)
  async update(req, res) {
    const { id } = req.params;
    const { name, slug, description, image_url, is_active, sort_order } = req.body;

    const result = await query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           is_active = COALESCE($5, is_active),
           sort_order = COALESCE($6, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, slug, description, image_url, is_active, sort_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  },

  // DELETE category (admin)
  async delete(req, res) {
    const { id } = req.params;
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted', deleted: result.rows[0] });
  },
};

module.exports = categoryController;
