import { prisma } from "../../../prismaConfig"
import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";

export const getQuotationById = async (_root, args, _context) => {
  let quoteByIdResponseObj;
  try {
    await authenticateDdCd(_context)
    const quote = await prisma.quote.findFirst({ where: { id: args.quoteid } })
    quoteByIdResponseObj = { code: 200, message: "success", quotes: quote }
    return quoteByIdResponseObj;
  } catch (error) {
    quoteByIdResponseObj = { code: 400, message: error.message }
    return quoteByIdResponseObj;
  }
}
