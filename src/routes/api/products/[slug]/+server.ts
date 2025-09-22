import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { products, brands, images, variants, productCategories, categories } from '$lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { slug } = params;

    // Get product with brand
    const productResult = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        sku: products.sku,
        isVegan: products.isVegan,
        hasSteelToe: products.hasSteelToe,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        createdAt: products.createdAt,
        brandId: brands.id,
        brandName: brands.name,
        brandDescription: brands.description,
        brandLogoUrl: brands.logoUrl,
        brandWebsite: brands.website
      })
      .from(products)
      .innerJoin(brands, eq(products.brandId, brands.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);

    const product = productResult[0];
    if (!product) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    // Get categories
    const productCategoriesResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug
      })
      .from(categories)
      .innerJoin(productCategories, eq(categories.id, productCategories.categoryId))
      .where(eq(productCategories.productId, product.id));

    // Get variants
    const productVariants = await db
      .select({
        id: variants.id,
        productId: variants.productId,
        size: variants.size,
        color: variants.color,
        sku: variants.sku,
        price: variants.price,
        stock: variants.stock,
        isActive: variants.isActive,
        createdAt: variants.createdAt,
        updatedAt: variants.updatedAt
      })
      .from(variants)
      .where(and(eq(variants.productId, product.id), eq(variants.isActive, true)))
      .orderBy(asc(variants.size));

    // Get images
    const productImages = await db
      .select({
        id: images.id,
        productId: images.productId,
        url: images.url,
        alt: images.alt,
        sortOrder: images.sortOrder,
        isPrimary: images.isPrimary,
        createdAt: images.createdAt
      })
      .from(images)
      .where(eq(images.productId, product.id))
      .orderBy(desc(images.isPrimary), asc(images.sortOrder), asc(images.id));

    const availableSizes = [...new Set(productVariants.map(v => v.size))].sort((a, b) => a - b);
    const availableColors = [...new Set(productVariants.map(v => v.color).filter(Boolean))];

    return json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        isVegan: product.isVegan,
        hasSteelToe: product.hasSteelToe,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        createdAt: product.createdAt,
        brand: {
          id: product.brandId,
          name: product.brandName,
          description: product.brandDescription,
          logoUrl: product.brandLogoUrl,
          website: product.brandWebsite
        },
        categories: productCategoriesResult,
        variants: productVariants,
        images: productImages,
        availableSizes,
        availableColors
      }
    });
  } catch (error) {
    console.error('Product detail API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
