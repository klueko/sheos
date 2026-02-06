import { sql } from 'drizzle-orm';
import { 
  sqliteTable, 
  text, 
  integer, 
  real, 
  blob,
  unique,
  primaryKey,
  index
} from 'drizzle-orm/sqlite-core';

// Brand table
export const brands = sqliteTable('brands', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  website: text('website'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Category table
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: integer('parent_id').references(() => categories.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Product table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  brandId: integer('brand_id').notNull().references(() => brands.id),
  price: real('price').notNull(),
  compareAtPrice: real('compare_at_price'),
  sku: text('sku').unique(),
  isVegan: integer('is_vegan', { mode: 'boolean' }).default(false),
  hasSteelToe: integer('has_steel_toe', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  brandIdx: index('products_brand_idx').on(table.brandId),
  slugIdx: index('products_slug_idx').on(table.slug),
  priceIdx: index('products_price_idx').on(table.price),
  veganIdx: index('products_vegan_idx').on(table.isVegan),
  steelToeIdx: index('products_steel_toe_idx').on(table.hasSteelToe)
}));

// Product Category pivot table
export const productCategories = sqliteTable('product_categories', {
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' })
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.categoryId] })
}));

// Product Variant table
export const variants = sqliteTable('variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  size: integer('size').notNull(), // EU sizes 35-48
  color: text('color'),
  sku: text('sku').unique(),
  price: real('price'),
  stock: integer('stock').default(0), // Total stock (onHand - reserved)
  onHand: integer('on_hand').default(0), // Physical stock available
  reserved: integer('reserved').default(0), // Stock reserved for pending orders
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  productIdx: index('variants_product_idx').on(table.productId),
  sizeIdx: index('variants_size_idx').on(table.size),
  stockIdx: index('variants_stock_idx').on(table.stock),
  onHandIdx: index('variants_on_hand_idx').on(table.onHand),
  reservedIdx: index('variants_reserved_idx').on(table.reserved)
}));

// Product Image table
export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt'),
  sortOrder: integer('sort_order').default(0),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  productIdx: index('images_product_idx').on(table.productId),
  sortIdx: index('images_sort_idx').on(table.sortOrder)
}));

// User table (for Lucia auth)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: text('role').default('CUSTOMER'), // CUSTOMER, STAFF, ADMIN
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// User Address table
export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // BILLING, SHIPPING
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company'),
  address1: text('address1').notNull(),
  address2: text('address2'),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  phone: text('phone'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdx: index('addresses_user_idx').on(table.userId)
}));

// Cart table
export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'), // For guest carts
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdx: index('carts_user_idx').on(table.userId),
  sessionIdx: index('carts_session_idx').on(table.sessionId)
}));

// Cart Item table
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').notNull().references(() => variants.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  cartIdx: index('cart_items_cart_idx').on(table.cartId),
  variantIdx: index('cart_items_variant_idx').on(table.variantId)
}));

// Order table
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  status: text('status').default('PENDING'), // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED, REFUNDED
  subtotal: real('subtotal').notNull(),
  tax: real('tax').default(0),
  shipping: real('shipping').default(0),
  total: real('total').notNull(),
  currency: text('currency').default('EUR'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  billingAddressId: integer('billing_address_id').references(() => addresses.id),
  shippingAddressId: integer('shipping_address_id').references(() => addresses.id),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdx: index('orders_user_idx').on(table.userId),
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt)
}));

// Order Item table
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').notNull().references(() => variants.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  variantIdx: index('order_items_variant_idx').on(table.variantId)
}));

// Take Back Request table (programme 2e vie)
export const takeBackRequests = sqliteTable('take_back_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').references(() => orders.id),
  status: text('status').default('PENDING'), // PENDING, APPROVED, REJECTED, COMPLETED
  items: text('items').notNull(), // JSON array of items to return
  reason: text('reason'),
  description: text('description'),
  creditAmount: real('credit_amount'),
  creditUsed: real('credit_used').default(0),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdx: index('take_back_requests_user_idx').on(table.userId),
  orderIdx: index('take_back_requests_order_idx').on(table.orderId),
  statusIdx: index('take_back_requests_status_idx').on(table.status)
}));

// Lucia Auth tables
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const userKeys = sqliteTable('user_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  hashedPassword: text('hashed_password')
});

// Data Deletion Request table (RGPD)
export const dataDeletionRequests = sqliteTable('data_deletion_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(),
  requestedAt: text('requested_at').notNull(),
  status: text('status').default('pending'), // pending, approved, rejected, completed
  reason: text('reason'),
  adminNotes: text('admin_notes'),
  processedAt: text('processed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  userIdx: index('data_deletion_requests_user_idx').on(table.userId),
  statusIdx: index('data_deletion_requests_status_idx').on(table.status),
  requestedAtIdx: index('data_deletion_requests_requested_at_idx').on(table.requestedAt)
}));

// Export types for TypeScript
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type TakeBackRequest = typeof takeBackRequests.$inferSelect;
export type NewTakeBackRequest = typeof takeBackRequests.$inferInsert;

export type DataDeletionRequest = typeof dataDeletionRequests.$inferSelect;
export type NewDataDeletionRequest = typeof dataDeletionRequests.$inferInsert;
