import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from "zod";
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/events/:eventId/attendees", {
      schema: {
        summary: "Get event attendee",
        tags: ["Get Event"],
        params: z.object({
          eventId: z.string()
        }),
        querystring: z.object({
          //Aqui vamos receber, através de um queryparams, a página onde o usuário se encontra e/ou quer acessar. Estamos recebendo como uma string, podendo ser null, tendo por padrão a primeiroa página e transformando em número.
          pageIndex: z.string().nullish().default('0').transform(Number),
          query: z.string().nullish()
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkdInAt: z.date().nullable()
              })
            )
          })
        }
      }
    }, async (request, reply) => {
      const {eventId} = request.params
      const {pageIndex, query} = request.query


      const attendees = await prisma.attendee.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true
            }
          }
        },
        where: query ? {
          eventId,
          name: {
            contains: query
          }

        } : {
          eventId
        } ,
        take: 10,
        skip: pageIndex * 10,
        orderBy: {
          createdAt: "desc"
        }
      })


      return reply.send({ 
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt,
            checkdInAt: attendee.checkIn?.createdAt ?? null
          }
        })
       })
    })
}