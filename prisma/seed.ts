import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BLOB_URL = 'https://eidlqojhxhr24tg7.public.blob.vercel-storage.com';

async function main() {
  console.log('🌱 Seeding Money\'s Outlet database with authentic brand catalog...');

  // 1. Admin user
  const adminEmail = 'admin@moneysoutlet.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    const admin = await prisma.user.create({
      data: {
        name: "Money's Outlet Admin",
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin user: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
  }

  // 2. Store Settings
  await prisma.storeSetting.upsert({
    where: { key: 'shipping_fee' },
    update: { value: '150' },
    create: { key: 'shipping_fee', value: '150' },
  });
  console.log('✅ Store settings initialized');

  // 3. Categories
  const categoriesData = [
    { id: 'cat-sneakers', name: 'Sneakers', slug: 'sneakers' },
    { id: 'cat-clothing', name: 'Clothing', slug: 'clothing' },
    { id: 'cat-accessories', name: 'Accessories', slug: 'accessories' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { id: cat.id, name: cat.name, slug: cat.slug },
    });
  }
  console.log(`✅ Seeded ${categoriesData.length} categories`);

  // 4. Brands
  const brandsData = [
    {
      id: 'b-jordan',
      name: 'Jordan',
      logoUrl: `${BLOB_URL}/logos/jordan-logo.svg`,
      defaultImage: `${BLOB_URL}/products/jordan_4_cement.png`,
      promoPercentage: 80,
      description: 'Coveted basketball heritage sneakers and premier collector grails',
    },
    {
      id: 'b-nike',
      name: 'Nike',
      logoUrl: `${BLOB_URL}/logos/nike-logo.png`,
      defaultImage: `${BLOB_URL}/products/travis_scott_angle.png`,
      promoPercentage: 50,
      description: 'Iconic athletic footwear and apparel defining global streetwear culture',
    },
    {
      id: 'b-adidas',
      name: 'Adidas',
      logoUrl: `${BLOB_URL}/logos/adidas-logo.png`,
      defaultImage: `${BLOB_URL}/products/yeezy_350_onyx_angle.png`,
      promoPercentage: 50,
      description: 'Pioneering footwear innovation, Three Stripes classics, and Yeezy silhouettes',
    },
    {
      id: 'b-nb',
      name: 'New Balance',
      logoUrl: `${BLOB_URL}/logos/new-balance-logo.png`,
      defaultImage: `${BLOB_URL}/products/nb_9060_grey.jpg`,
      promoPercentage: 40,
      description: 'Exceptional Boston craftsmanship and premium lifestyle runner silhouettes',
    },
    {
      id: 'b-essentials',
      name: 'Essentials',
      logoUrl: `${BLOB_URL}/logos/essentials-logo.svg`,
      defaultImage: `${BLOB_URL}/products/streetwear_hoodie.jpg`,
      promoPercentage: 30,
      description: 'Jerry Lorenzo\'s elevated luxury streetwear basics and heavyweight fleece loungewear',
    },
    {
      id: 'b-supreme',
      name: 'Supreme',
      logoUrl: `${BLOB_URL}/logos/supreme-logo.svg`,
      defaultImage: `${BLOB_URL}/products/supreme_bogo_crew.jpg`,
      promoPercentage: 20,
      description: 'New York skate culture authority and the world\'s most recognizable box logo',
    },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { name: b.name },
      update: {
        logoUrl: b.logoUrl,
        defaultImage: b.defaultImage,
        promoPercentage: b.promoPercentage,
        description: b.description,
      },
      create: {
        id: b.id,
        name: b.name,
        logoUrl: b.logoUrl,
        defaultImage: b.defaultImage,
        promoPercentage: b.promoPercentage,
        description: b.description,
      },
    });
  }
  console.log(`✅ Seeded ${brandsData.length} brands`);

  // 5. Products
  const productsData = [
    {
      id: 'prod-travis-scott-mocha',
      name: 'Travis Scott x Air Jordan 1 Low OG Reverse Mocha',
      description: 'Signature low-top grail featuring reverse sail Swoosh, premium mocha nubuck, tumbled leather, and University Red Cactus Jack heel embroidery.',
      price: 1850,
      discountPrice: 1650,
      stock: 7,
      images: [
        `${BLOB_URL}/products/travis_scott_mocha.jpg`,
        `${BLOB_URL}/products/travis_scott_angle.jpg`,
      ],
      colors: ['#4A3728', '#FFFFFF', '#D91E18'],
      sizes: ['40', '41', '42', '43', '44', '45'],
      categorySlug: 'sneakers',
      brandName: 'Jordan',
      isFeatured: true,
      isNewArrival: true,
      isPromotion: true,
    },
    {
      id: 'prod-jordan-4-cement',
      name: 'Air Jordan 4 Retro White Cement',
      description: 'Iconic retro silhouette crafted with premium full-grain leather, speckled cement wings and midsole, and responsive visible Air cushioning.',
      price: 1500,
      discountPrice: 1350,
      stock: 12,
      images: [
        `${BLOB_URL}/products/jordan_4_cement.jpg`,
        `${BLOB_URL}/products/jordan_4_cement_angle.jpg`,
      ],
      colors: ['#FFFFFF', '#1A1A1A', '#FF4444'],
      sizes: ['39', '40', '41', '42', '43', '44'],
      categorySlug: 'sneakers',
      brandName: 'Jordan',
      isFeatured: true,
      isNewArrival: false,
      isPromotion: true,
    },
    {
      id: 'prod-dunk-low-panda',
      name: 'Nike Dunk Low Retro Panda',
      description: 'Timeless monochrome color-blocking with smooth leather overlays, perforated toe box, and padded low-cut collar for everyday versatility.',
      price: 1100,
      discountPrice: 950,
      stock: 20,
      images: [
        `${BLOB_URL}/products/nike_dunk_1.png`,
        `${BLOB_URL}/products/dunk_panda_lateral.jpg`,
      ],
      colors: ['#1A1A1A', '#FFFFFF'],
      sizes: ['38', '39', '40', '41', '42', '43', '44'],
      categorySlug: 'sneakers',
      brandName: 'Nike',
      isFeatured: true,
      isNewArrival: true,
      isPromotion: true,
    },
    {
      id: 'prod-jordan-1-bred',
      name: 'Air Jordan 1 Retro High OG Bred',
      description: 'The legendary silhouette that started sneaker culture. Premium black and varsity red tumbled leather with Nike Air tongue tag and classic Wings branding.',
      price: 1600,
      discountPrice: null,
      stock: 10,
      images: [
        `${BLOB_URL}/products/nike_shoe_1.png`,
      ],
      colors: ['#1A1A1A', '#D91E18', '#FFFFFF'],
      sizes: ['40', '41', '42', '43', '44'],
      categorySlug: 'sneakers',
      brandName: 'Jordan',
      isFeatured: true,
      isNewArrival: false,
      isPromotion: false,
    },
    {
      id: 'prod-yeezy-350-onyx',
      name: 'Adidas Yeezy Boost 350 V2 Onyx',
      description: 'Futuristic stealth silhouette featuring triple black re-engineered Primeknit upper, post-dyed monofilament side stripe, and full-length Boost sole.',
      price: 1750,
      discountPrice: null,
      stock: 8,
      images: [
        `${BLOB_URL}/products/yeezy_350_onyx.jpg`,
        `${BLOB_URL}/products/yeezy_350_onyx_angle.jpg`,
      ],
      colors: ['#1A1A1A'],
      sizes: ['39', '40', '41', '42', '43'],
      categorySlug: 'sneakers',
      brandName: 'Adidas',
      isFeatured: true,
      isNewArrival: false,
      isPromotion: false,
    },
    {
      id: 'prod-yeezy-350-cream',
      name: 'Adidas Yeezy Boost 350 V2 Bone',
      description: 'Clean ivory-white Primeknit upper with semi-translucent monofilament stripe and signature ribbed encapsulating Boost midsole.',
      price: 1650,
      discountPrice: 1450,
      stock: 14,
      images: [
        `${BLOB_URL}/products/adidas_shoe_1.png`,
      ],
      colors: ['#F5E6BE', '#FFFFFF'],
      sizes: ['39', '40', '41', '42'],
      categorySlug: 'sneakers',
      brandName: 'Adidas',
      isFeatured: false,
      isNewArrival: true,
      isPromotion: true,
    },
    {
      id: 'prod-nb-9060',
      name: 'New Balance 9060 Rain Cloud',
      description: 'Sculpted futuristic runner with airy mesh, wavy premium suede overlays, and dual-density ABZORB and SBS cushioning.',
      price: 1300,
      discountPrice: null,
      stock: 15,
      images: [
        `${BLOB_URL}/products/nb_9060_grey.jpg`,
        `${BLOB_URL}/products/nb_9060_lateral.jpg`,
      ],
      colors: ['#B3B3B3', '#1A1A1A', '#F5E6BE'],
      sizes: ['40', '41', '42', '43', '44'],
      categorySlug: 'sneakers',
      brandName: 'New Balance',
      isFeatured: true,
      isNewArrival: true,
      isPromotion: false,
    },
    {
      id: 'prod-nb-2002r',
      name: 'New Balance 2002R Protection Pack Rain Cloud',
      description: 'Deconstructed aesthetic with rough-cut jagged suede overlays, breathable mesh base, and N-ergy shock absorbing sole.',
      price: 1400,
      discountPrice: 1250,
      stock: 11,
      images: [
        `${BLOB_URL}/products/nb_shoe_1.png`,
      ],
      colors: ['#808080', '#D3D3D3', '#1A1A1A'],
      sizes: ['40', '41', '42', '43'],
      categorySlug: 'sneakers',
      brandName: 'New Balance',
      isFeatured: false,
      isNewArrival: true,
      isPromotion: true,
    },
    {
      id: 'prod-essentials-hoodie',
      name: 'Essentials Fear of God Heavyweight Fleece Hoodie',
      description: 'Signature boxy fit hoodie crafted from custom 480gsm heavyweight cotton fleece with rubberized ESSENTIALS back branding and hood patch.',
      price: 750,
      discountPrice: 650,
      stock: 18,
      images: [
        `${BLOB_URL}/products/streetwear_hoodie.jpg`,
        `${BLOB_URL}/products/essentials_hoodie_back.jpg`,
      ],
      colors: ['#1A1A1A', '#808080', '#F5E6BE'],
      sizes: ['S', 'M', 'L', 'XL'],
      categorySlug: 'clothing',
      brandName: 'Essentials',
      isFeatured: true,
      isNewArrival: true,
      isPromotion: true,
    },
    {
      id: 'prod-supreme-bogo',
      name: 'Supreme Box Logo Heavyweight Crewneck',
      description: 'Heavyweight crossgrain cotton fleece crewneck featuring the iconic high-density embroidered Supreme red box logo across the chest.',
      price: 850,
      discountPrice: null,
      stock: 9,
      images: [
        `${BLOB_URL}/products/supreme_bogo_crew.jpg`,
      ],
      colors: ['#B3B3B3', '#D91E18'],
      sizes: ['M', 'L', 'XL'],
      categorySlug: 'clothing',
      brandName: 'Supreme',
      isFeatured: true,
      isNewArrival: true,
      isPromotion: false,
    },
  ];

  for (const p of productsData) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    const brand = await prisma.brand.findUnique({ where: { name: p.brandName } });

    if (category && brand) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice,
          stock: p.stock,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          categoryId: category.id,
          brandId: brand.id,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isPromotion: p.isPromotion,
        },
        create: {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice,
          stock: p.stock,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          categoryId: category.id,
          brandId: brand.id,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isPromotion: p.isPromotion,
        },
      });
    }
  }
  console.log(`✅ Seeded ${productsData.length} authentic products`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
