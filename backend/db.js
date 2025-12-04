const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        phone TEXT,
        default_zip_code TEXT,
        stripe_account_id TEXT,
        stripe_customer_id TEXT,
        profile_photo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        area_description TEXT,
        full_address TEXT,
        price DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'requested',
        poster_id TEXT REFERENCES users(id),
        poster_name TEXT,
        poster_email TEXT,
        poster_photo_url TEXT,
        helper_id TEXT REFERENCES users(id),
        helper_name TEXT,
        confirmation_code TEXT,
        photos_required BOOLEAN DEFAULT FALSE,
        tools_required BOOLEAN DEFAULT FALSE,
        tools_provided BOOLEAN DEFAULT FALSE,
        task_photo_url TEXT,
        stripe_checkout_session_id TEXT,
        stripe_payment_intent_id TEXT,
        stripe_charge_id TEXT,
        platform_fee_amount INTEGER,
        helper_amount INTEGER,
        payment_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        accepted_at TIMESTAMP,
        completed_at TIMESTAMP,
        canceled_at TIMESTAMP,
        canceled_by TEXT
      );

      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        task_id TEXT REFERENCES tasks(id),
        helper_id TEXT REFERENCES users(id),
        helper_name TEXT,
        helper_photo_url TEXT,
        note TEXT,
        proposed_price DECIMAL(10,2),
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_threads (
        id TEXT PRIMARY KEY,
        task_id TEXT REFERENCES tasks(id),
        poster_id TEXT REFERENCES users(id),
        helper_id TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_closed BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT REFERENCES chat_threads(id),
        sender_id TEXT REFERENCES users(id),
        sender_name TEXT,
        text TEXT,
        image_url TEXT,
        is_proof BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id TEXT,
        task_id TEXT,
        offer_id TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS extra_work_requests (
        id TEXT PRIMARY KEY,
        task_id TEXT REFERENCES tasks(id),
        helper_id TEXT REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT NOT NULL,
        photo_urls TEXT[],
        status TEXT DEFAULT 'pending',
        stripe_checkout_session_id TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP,
        paid_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS disputes (
        id TEXT PRIMARY KEY,
        task_id TEXT REFERENCES tasks(id),
        initiator_id TEXT REFERENCES users(id),
        initiator_role TEXT NOT NULL,
        reason TEXT NOT NULL,
        poster_photo_urls TEXT[] DEFAULT '{}',
        helper_photo_urls TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'pending',
        resolution TEXT,
        amount_released DECIMAL(10,2),
        amount_refunded DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );

      -- Add columns if they don't exist (for migrations)
      DO $$ 
      BEGIN
        BEGIN ALTER TABLE users ADD COLUMN profile_photo_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN tools_required BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN tools_provided BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN task_photo_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN poster_photo_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE offers ADD COLUMN helper_photo_url TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN tip_amount DECIMAL(10,2); EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN tip_stripe_payment_intent_id TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN tip_created_at TIMESTAMP; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN extra_amount_paid DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN photos TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN dispute_id TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN disputed_at TIMESTAMP; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN disputed_by TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN price_adjust_prompt_shown BOOLEAN DEFAULT FALSE; EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN ALTER TABLE tasks ADD COLUMN price_adjusted_at TIMESTAMP; EXCEPTION WHEN duplicate_column THEN NULL; END;
      END $$;
    `);
    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDatabase };
