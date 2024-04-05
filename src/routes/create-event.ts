import { ZodTypeProvider } from "fastify-type-provider-zod"
import {z} from "zod"
import { generateSlug } from "../utils/generate-slug"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { BadRequest } from "./_errors/bad-request"

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/events", {
    // Aqui estamos validando as informações que chega nesta rota, antes essa validação era feita com o método parse do zod, agora, o fastify consegue fazer essa validação, essa forma de validar lembra um Middleware.
    schema: {
      summary: "create an event",
      body: z.object({
        title: z.string().min(4),
        datails: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
      }),
      response: {
        201: z.object({
          eventId: z.string().uuid()
        })
      }
    }
  }, async (request, reply) => {
    const {
      title,
      datails,
      maximumAttendees
    } = request.body
  
    const slug = generateSlug(title)
  
    const eventWithSameSlug = await prisma.event.findUnique({
      where: {
        slug
      }
    })
  
    if (eventWithSameSlug !== null) {
      throw new BadRequest("Este evento já existe.")
    }
  
    const event = await prisma.event.create({
      data: {
        title,
        datails,
        maximumAttendees,
        slug
      }
    })
    return reply.status(201).send({ eventId: event.id })
  })
}
