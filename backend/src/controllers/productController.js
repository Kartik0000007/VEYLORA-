const { query } = require('../models/db');

const AMAZON_IN_HOST = 'amazon.in';

function isValidAmazonInUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === AMAZON_IN_HOST || parsed.hostname === `www.${AMAZON_IN_HOST}`;
  } catch {
    return false;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const productController = {
  // GET all products (with optional filters)
  // Public endpoint: always returns only active products.
  // Admin (authenticated) can pass ?active=false to see all.
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

    // Always filter to active products unless the caller is authenticated
    // and explicitly requests all products (including inactive).
    const isAdmin = req.user && req.user.id;
    if (!isAdmin || active !== 'false') {
      sql += ` AND p.is_active = TRUE`;
    } else if (active === 'false') {
      // Admin explicitly requesting all products; no is_active filter
    }

    if (category) {
      sql += ` AND c.slug = $${paramIndex++}`;
      params.push(category);
    }
    if (featured === 'true') {
      sql += ` AND p.is_featured = TRUE`;
    }

    sql += ` ORDER BY p.sort_order ASC, p.created_at DESC`;

    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(parseInt(limit, 10));
    }
    if (offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(parseInt(offset, 10));
    }

    const result = await query(sql, params);
    res.json(result.rows);
  },

  // GET single product by slug
  // Public: only active products. Admin: any product by slug.
  async getBySlug(req, res) {
    const { slug } = req.params;
    const isAdmin = req.user && req.user.id;

    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1
    `;
    const params = [slug];

    if (!isAdmin) {
      sql += ` AND p.is_active = TRUE`;
    }

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  },

  // GET single product by id (admin only)
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
      target_audience, aesthetic, product_type, tags,
      product_source, affiliate_network, availability_status,
      seo_title, seo_description,
    } = req.body;

    if (!name || price == null || !image_url) {
      return res.status(400).json({ error: 'Name, price, and image_url are required' });
    }

    // Validate affiliate URL: must be a valid Amazon.in URL
    if (!affiliate_url || !isValidAmazonInUrl(affiliate_url)) {
      return res.status(400).json({ error: 'affiliate_url must be a valid Amazon.in URL' });
    }

    // Auto-generate slug if not provided
    const generatedSlug = slug || slugify(name);

    try {
      const result = await query(
        `INSERT INTO products
         (category_id, name, slug, description, brand, price, original_price, currency,
          affiliate_url, image_url, is_active, is_featured, sort_order,
          target_audience, aesthetic, product_type, tags, product_source,
          affiliate_network, availability_status, seo_title, seo_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                 $14, $15, $16, $17, $18, $19, $20, $21, $22)
         RETURNING *`,
        [
          category_id || null, name, generatedSlug, description || null, brand || null,
          price, original_price || null, currency || 'INR', affiliate_url, image_url,
          is_active !== false, is_featured === true, sort_order || 0,
          target_audience || null, aesthetic || null, product_type || null,
          tags || [], product_source || null, affiliate_network || 'Amazon Associates',
          availability_status || 'available', seo_title || null, seo_description || null,
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
      target_audience, aesthetic, product_type, tags,
      product_source, affiliate_network, availability_status,
      seo_title, seo_description,
    } = req.body;

    // If affiliate_url is provided, validate it
    if (affiliate_url !== undefined && affiliate_url !== null && !isValidAmazonInUrl(affiliate_url)) {
      return res.status(400).json({ error: 'affiliate_url must be a valid Amazon.in URL' });
    }

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
           target_audience = COALESCE($14, target_audience),
           aesthetic = COALESCE($15, aesthetic),
           product_type = COALESCE($16, product_type),
           tags = COALESCE($17, tags),
           product_source = COALESCE($18, product_source),
           affiliate_network = COALESCE($19, affiliate_network),
           availability_status = COALESCE($20, availability_status),
           last_price_verified = COALESCE($21, last_price_verified),
           last_content_update = CURRENT_TIMESTAMP,
           seo_title = COALESCE($22, seo_title),
           seo_description = COALESCE($23, seo_description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $24
       RETURNING *`,
      [
        category_id, name, slug, description, brand, price,
        original_price, currency, affiliate_url, image_url,
        is_active, is_featured, sort_order,
        target_audience, aesthetic, product_type, tags,
        product_source, affiliate_network, availability_status,
        undefined, seo_title, seo_description, id,
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
