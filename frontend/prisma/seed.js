const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing database tables...')
  await prisma.expense.deleteMany({})
  await prisma.budget.deleteMany({})
  await prisma.goal.deleteMany({})
  await prisma.recurringExpense.deleteMany({})
  await prisma.anomaly.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Seeding demo user...')
  const user = await prisma.user.create({
    data: {
      id: 'default-user-id',
      email: 'user@expensetracker.com',
      password: '$2a$12$KIXH37eM.K.9s/m7u70oUeYyXy2p1kG7vJ3Hj3v1Z3Z3Z3Z3Z3Z3Z', // dummy hash
      name: 'Alex Morgan',
    },
  })

  console.log('Seeding categories...')
  const categoriesData = [
    { name: 'Housing & Rent', icon: '🏠', color: '#EF4444', keywords: 'rent,mortgage,apartment' },
    { name: 'Food & Dining', icon: '🍔', color: '#F59E0B', keywords: 'swiggy,zomato,restaurant,groceries,starbucks' },
    { name: 'Transportation', icon: '🚗', color: '#10B981', keywords: 'uber,fuel,metro,hpcl,petrol' },
    { name: 'Utilities & Bills', icon: '⚡', color: '#3B82F6', keywords: 'electricity,broadband,wifi,water,mobile' },
    { name: 'Entertainment', icon: '🎬', color: '#6366F1', keywords: 'netflix,spotify,movies,steam' },
    { name: 'Shopping & Retail', icon: '🛍️', color: '#EC4899', keywords: 'amazon,myntra,dmart,zara' },
    { name: 'Health & Fitness', icon: '🏋️', color: '#8B5CF6', keywords: 'cult.fit,pharmacy,doctor,gym' },
    { name: 'Salary & Income', icon: '💼', color: '#10B981', keywords: 'salary,paycheck,freelance,reimbursement' },
  ]

  const categoryMap = {}
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        ...cat,
        userId: user.id,
      },
    })
    categoryMap[cat.name] = created
  }

  console.log('Seeding realistic budgets...')
  const budgetsData = [
    { categoryName: 'Food & Dining', amount: 15000, period: 'monthly' },
    { categoryName: 'Housing & Rent', amount: 35000, period: 'monthly' },
    { categoryName: 'Transportation', amount: 8000, period: 'monthly' },
    { categoryName: 'Utilities & Bills', amount: 6000, period: 'monthly' },
    { categoryName: 'Entertainment', amount: 5000, period: 'monthly' },
    { categoryName: 'Shopping & Retail', amount: 12000, period: 'monthly' },
  ]

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  for (const b of budgetsData) {
    const category = categoryMap[b.categoryName]
    if (category) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          amount: b.amount,
          period: b.period,
          startDate: startOfMonth,
          endDate: endOfMonth,
        },
      })
    }
  }

  console.log('Seeding realistic savings goals...')
  const goalsData = [
    { title: 'Emergency Fund', targetAmount: 200000, currentAmount: 145000, deadline: new Date(now.getFullYear(), 11, 31), category: 'Savings' },
    { title: 'Japan Vacation 2026', targetAmount: 180000, currentAmount: 85000, deadline: new Date(now.getFullYear() + 1, 3, 30), category: 'Travel' },
    { title: 'MacBook Pro M3 Upgrade', targetAmount: 150000, currentAmount: 110000, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 15), category: 'Tech' },
  ]

  for (const g of goalsData) {
    await prisma.goal.create({
      data: {
        userId: user.id,
        ...g,
      },
    })
  }

  console.log('Seeding recurring expenses...')
  const recurringData = [
    { description: 'Apartment Rent', amount: 32000, categoryName: 'Housing & Rent', frequency: 'monthly', day: 1 },
    { description: 'Airtel Broadband Wi-Fi', amount: 1179, categoryName: 'Utilities & Bills', frequency: 'monthly', day: 5 },
    { description: 'Netflix Premium 4K Plan', amount: 649, categoryName: 'Entertainment', frequency: 'monthly', day: 12 },
    { description: 'Spotify Family Subscription', amount: 179, categoryName: 'Entertainment', frequency: 'monthly', day: 18 },
    { description: 'Cult.fit Elite Membership', amount: 1750, categoryName: 'Health & Fitness', frequency: 'monthly', day: 25 },
  ]

  for (const r of recurringData) {
    const category = categoryMap[r.categoryName]
    if (category) {
      const nextDue = new Date(now.getFullYear(), now.getMonth(), r.day)
      if (nextDue < now) nextDue.setMonth(nextDue.getMonth() + 1)
      await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          description: r.description,
          amount: r.amount,
          categoryId: category.id,
          frequency: r.frequency,
          nextDueDate: nextDue,
          active: true,
        },
      })
    }
  }

  console.log('Generating 6 months of realistic transactions...')
  const transactionsTemplate = [
    { description: 'Zomato Food Delivery - Third Wave Coffee', amount: 340, category: 'Food & Dining', merchant: 'Zomato' },
    { description: 'Swiggy Gourmet Dinner Order', amount: 890, category: 'Food & Dining', merchant: 'Swiggy' },
    { description: 'Starbucks Iced Caramel Macchiato', amount: 410, category: 'Food & Dining', merchant: 'Starbucks' },
    { description: 'DMart Supermarket Monthly Groceries', amount: 4520, category: 'Food & Dining', merchant: 'DMart' },
    { description: 'Organic World Fresh Produce', amount: 1250, category: 'Food & Dining', merchant: 'Organic World' },
    { description: 'Uber Auto commute to office', amount: 185, category: 'Transportation', merchant: 'Uber' },
    { description: 'HPCL Auto-Fuel Refill', amount: 2500, category: 'Transportation', merchant: 'HPCL Petrol Pump' },
    { description: 'Namma Metro Card Recharge', amount: 500, category: 'Transportation', merchant: 'Namma Metro' },
    { description: 'Apartment Monthly Rent Transfer', amount: 32000, category: 'Housing & Rent', merchant: 'HDFC NetBanking' },
    { description: 'BESCOM Monthly Electricity Bill', amount: 2450, category: 'Utilities & Bills', merchant: 'BESCOM' },
    { description: 'Jio Prepaid Mobile Recharge', amount: 749, category: 'Utilities & Bills', merchant: 'Jio' },
    { description: 'Amazon Order - Wireless Mechanical Keyboard', amount: 4999, category: 'Shopping & Retail', merchant: 'Amazon' },
    { description: 'Myntra End of Reason Sale Haul', amount: 3450, category: 'Shopping & Retail', merchant: 'Myntra' },
    { description: 'PVR IMAX Movie Tickets - Dune Part 2', amount: 1100, category: 'Entertainment', merchant: 'BookMyShow' },
    { description: 'Apollo Pharmacy Medicines', amount: 680, category: 'Health & Fitness', merchant: 'Apollo Pharmacy' },
    { description: 'Salary Credit - TechCorp Pvt Ltd', amount: 145000, category: 'Salary & Income', merchant: 'Employer Direct Deposit' },
  ]

  // Generate for past 5 months + current month
  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()

    // Monthly Salary on 1st
    const salaryCategory = categoryMap['Salary & Income']
    await prisma.expense.create({
      data: {
        userId: user.id,
        description: 'Monthly Salary Credit - TechCorp',
        amount: 145000,
        categoryId: salaryCategory.id,
        date: new Date(year, month, 1, 10, 0),
      },
    })

    // Rent on 2nd
    const rentCategory = categoryMap['Housing & Rent']
    await prisma.expense.create({
      data: {
        userId: user.id,
        description: 'Apartment Monthly Rent Transfer',
        amount: 32000,
        categoryId: rentCategory.id,
        date: new Date(year, month, 2, 11, 30),
      },
    })

    // Random 15-20 transactions scattered across the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const maxDay = (m === 0) ? Math.min(now.getDate(), daysInMonth) : daysInMonth

    for (let i = 0; i < 18; i++) {
      const template = transactionsTemplate[Math.floor(Math.random() * (transactionsTemplate.length - 2))]
      const day = Math.floor(Math.random() * maxDay) + 1
      const hour = Math.floor(Math.random() * 12) + 9
      const category = categoryMap[template.category]

      if (category) {
        // add slight natural variance to amount
        const variance = (Math.random() * 0.2 - 0.1) * template.amount
        const finalAmount = Math.round(template.amount + variance)

        await prisma.expense.create({
          data: {
            userId: user.id,
            description: template.description,
            amount: Math.max(50, finalAmount),
            categoryId: category.id,
            date: new Date(year, month, day, hour, Math.floor(Math.random() * 60)),
          },
        })
      }
    }
  }

  console.log('Seeding detected anomalies...')
  await prisma.anomaly.create({
    data: {
      userId: user.id,
      description: 'Unusual spike in dining out: 3 transactions over ₹1,500 within 24 hours',
      severity: 'medium',
      resolved: false,
    },
  })

  await prisma.anomaly.create({
    data: {
      userId: user.id,
      description: 'Duplicate charge detected from Amazon: ₹4,999 charged twice',
      severity: 'high',
      resolved: false,
    },
  })

  console.log('Comprehensive realistic demo data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
