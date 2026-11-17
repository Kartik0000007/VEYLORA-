const { query } = require('../models/db');

const productController = {
  // GET all products (with optional filters)
  async getAll(req, res) {
    const { category, featured, active, limit, offset } = req.query;

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }
    if (featured === 'true') {
      sql += ` AND p.is_featured = TRUE`;
    }
    if (active !== 'false') {
      sql += ` AND p.is_active = TRUE`;
    }

    sql += ` ORDER BY p.sort_order ASC, p.created_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit));
    }
    if (offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(parseInt(offset));
    }

    const result = await query(sql, params);
    res.json(result.rows);
  },

  // GET single product by slug
  async getBySlug(req, res) {
    const { slug } = req.params;
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1`,
      [slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  },

  // GET single product by id
  async getById(req, res) {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  },

  // CREATE product (admin)
  async create(req, res) {
    const {
      category_id, name, slug, description, brand, price,
      original_price, currency, affiliate_url, image_url,
      is_active, is_featured, sort_order,
    } = req.body;

    if (!name || !slug || price == null || !affiliate_url || !image_url) {
      return res.status(400).json({ error: 'Name, slug, price, affiliate_url, and image_url are required' });
    }

    try {
      const result = await query(
        `INSERT INTO products
         (category_id, name, slug, description, brand, price, original_price, currency, affiliate_url, image_url, is_active, is_featured, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          category_id || null, name, slug, description || null, brand || null,
          price, original_price || null, currency || 'INR', affiliate_url, image_url,
          is_active !== false, is_featured === true, sort_order || 0,
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Product slug already exists' });
      }
      throw err;
    }
  },

  // UPDATE product (admin)
  async update(req, res) {
    const { id } = req.params;
    const {
      category_id, name, slug, description, brand, price,
      original_price, currency, affiliate_url, image_url,
      is_active, is_featured, sort_order,
    } = req.body;

    const result = await query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           description = COALESCE($4, description),
           brand = COALESCE($5, brand),
           price = COALESCE($6, price),
           original_price = COALESCE($7, original_price),
           currency = COALESCE($8, currency),
           affiliate_url = COALESCE($9, affiliate_url),
           image_url = COALESCE($10, image_url),
           is_active = COALESCE($11, is_active),
           is_featured = COALESCE($12, is_featured),
           sort_order = COALESCE($13, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        category_id, name, slug, description, brand, price,
        original_price, currency, affiliate_url, image_url,
        is_active, is_featured, sort_order, id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  },

  // DELETE product (admin)
  async delete(req, res) {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', deleted: result.rows[0] });
  },
};

module.exports = productController;
