import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial categories...')
  
  const defaultCategories = [
    { name: 'Housing & Rent', icon: 'home', color: '#EF4444', keywords: 'rent,mortgage,housing' },
    { name: 'Food & Dining', icon: 'utensils', color: '#F59E0B', keywords: 'food,restaurant,groceries,dining' },
    { name: 'Transportation', icon: 'car', color: '#10B981', keywords: 'fuel,bus,train,uber,cab,flight' },
    { name: 'Entertainment', icon: 'film', color: '#6366F1', keywords: 'movie,games,netflix,music' },
    { name: 'Utilities & Bills', icon: 'zap', color: '#3B82F6', keywords: 'electricity,water,gas,internet,phone' },
    { name: 'Shopping & Retail', icon: 'shopping-bag', color: '#EC4899', keywords: 'clothes,shoes,electronics,amazon' },
    { name: 'Health & Fitness', icon: 'heart', color: '#8B5CF6', keywords: 'doctor,gym,pharmacy,medical' },
    { name: 'Salary & Income', icon: 'dollar-sign', color: '#10B981', keywords: 'salary,paycheck,freelance,bonus' },
  ]

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: cat,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
