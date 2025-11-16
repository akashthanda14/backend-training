import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'userpassword123',
  database: process.env.DB_NAME || 'myapp_db',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}

const pool = mysql.createPool(dbConfig)

const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✓ Database connection established successfully')
    console.log(`✓ Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`)
    connection.release()
    return true
  } catch (error) {
    console.error('✗ Database connection failed:', error.message)
    console.error('Connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    })
    return false
  }
}

testConnection()

export const query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error.message)
    console.error('SQL:', sql)
    console.error('Params:', params)
    throw error
  }
}

export const getConnection = async () => {
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error('Failed to get database connection:', error.message)
    throw error
  }
}

export const closePool = async () => {
  try {
    await pool.end()
    console.log('✓ Database connection pool closed')
  } catch (error) {
    console.error('Error closing database pool:', error.message)
    throw error
  }
}

process.on('SIGINT', async () => {
  await closePool()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closePool()
  process.exit(0)
})

export default pool
