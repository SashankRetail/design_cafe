import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { prisma } from "../../../prismaConfig";

export const getCustomerDetailsByAuth = async (_parent, _args, context) => {
  let response: { code: number; message: string; data?: any };
  try {
    const customerDetails = await authenticate(context, "CD");
    const projectData = await prisma.dc_projects.findFirst({
      where: { opportunityid: customerDetails.opportunityid },
    });
    const Obj = {
      Customer: customerDetails,
    };
    if (projectData) {
      Obj["projectid"] = projectData.id;
      Obj["clientid"] = projectData.clientid || projectData.projectid;
      Obj["projectstatus"] = projectData.projectstatus;
      Obj["smartsheetid"] = projectData.smartsheetid;
      Obj["quoteid"] = projectData.quoteid;
      Obj["isnewpaymentproject"] = projectData.isnewpaymentproject;
    }
    response = {
      data: Obj,
      message: "success",
      code: 200,
    };
  } catch (e) {
    response = {
      message: e.message,
      code: 500,
    };
  }
  return response;
};
