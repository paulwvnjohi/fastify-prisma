import fastify from "fastify"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const server = fastify()

interface ProductData {
    name: string
    description: string
    price: number
    sku: string
}

interface Review {
    title: string
    body: string
    productId: string
}

server.get('/products', async (request, reply) => {
    try {
        return prisma.product.findMany({
            include: {
                reviews: {
                    select: {
                        id: true,
                        title: true,
                        body: true
                    }
                }
            }
        })
    } catch (error) {
        return error
    }
})

server.post<{
    Body: ProductData
}>('/products', async (request, reply) => {
    try {
        const product = await prisma.product.create({
            data: request.body
        })
        return product

    } catch (error) {
        return error
    }
})

server.post<{ Body: Review }>('/reviews', async (request, reply) => {
    try {
        const body: Review = request.body
        const review = await prisma.review.create({
            data: {
                title: body.title,
                body: body.body,
                product: {
                    connect: {
                        id: body.productId
                    }
                }
            }
        })
        return review
    } catch (error) {
        return error
    }
})

server.listen(8000, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }

    console.log(`server listening at ${address}`)
})