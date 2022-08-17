import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";

export const getLeadAttachments = async (root, args, context) => {
  let getFilesResponseObj;
  try {
    let data;
    if (args.type === 0) {
      if (!args.leadid) {
        throw new HttpError(400, "lead id is required");
      }
      console.log("lead files/presales");
      data = await prisma.dc_attachments.findMany({
        where: { leadid: args.leadid, ispreorpost: 0, opportunityid: null },
      });
      const fetchedLead = await prisma.lead.findFirst({ where: { sfid: args.leadid } })
      if (!fetchedLead) {
        throw new HttpError(400, "lead not found");
      }
      if(fetchedLead.floor_plan_attachment_id__c){
        const floorPlan = await prisma.dc_attachments.findFirst({ where: { id: Number(fetchedLead.floor_plan_attachment_id__c )} })
        data.push(floorPlan)
      }

    } else if (args.type === 1) {
      if (!args.opportunityid) {
        throw new HttpError(400, "opportunity id is required");
      }
      console.log("opportunity files/presales");
      let leadid;
      if (!args.leadid) {
        const opportunity = await prisma.opportunity.findUnique({
          where: { sfid: args.opportunityid },
        });
        if (!opportunity) {
          throw new HttpError(400, "opportunity not found");
        }
        leadid = opportunity.lead_id__c

      } else {
        leadid = args.leadid
      }
      const leadFiles = await getLeadFilesForOpportunity(leadid)


      const opportunityFiles = await prisma.dc_attachments.findMany({
        where: { opportunityid: args.opportunityid, ispreorpost: 0 }
      });
      data = leadFiles.concat(opportunityFiles)

    }
    data = await getUploadedBy(data)

    getFilesResponseObj = { code: 200, message: "success", data: data };
    return getFilesResponseObj;
  } catch (error) {
    getFilesResponseObj = { code: 400, message: error.message };
    return getFilesResponseObj;

  }

};
const getUploadedBy = async (data) => {
  let user,customer;
  if (data.length > 0) {
    await Promise.all(
      data.map(async (element) => {
        if (element.user) {
          user = await prisma.dc_users.findUnique({ where: { userid: element.user } })
          element.uploadedby = user.firstname
        }else if(element.customer){
          customer = await prisma.dc_customer.findUnique({ where: { customerid: element.customer } })
          element.uploadedby = customer.firstname
        }
      })
    )
  }
  return data

}
const getLeadFilesForOpportunity = async (leadid) => {
  let leadFiles;
  if (leadid) {
    leadFiles = await prisma.dc_attachments.findMany({
      where: { leadid: leadid, ispreorpost: 0 }
    });
  } else {
    leadFiles = []
  }
  return leadFiles
}
