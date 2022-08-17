import { prisma } from "../../../prismaConfig";
import { LeadsResponse } from "../LeadsResponseInterface";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";

const getLeadDetailsFromId = async (leadSfId) => {
  if (leadSfId) {
    return prisma.lead.findFirst({
      where: {
        sfid: leadSfId,
      },
    });
  }
  return null;
};

const updateBroadCastedLeads = async (dataToBeUpdated, leadSfId) => {
  console.log(dataToBeUpdated, leadSfId);
  return prisma.lead.update({
    data: dataToBeUpdated,
    where: { sfid: leadSfId },
  });
};

export const acceptRejectLeads = async (_root, args, _context) => {
  const acceptRejectResponse: LeadsResponse = {
    code: 200,
    message: null,
    data: null,
  };
  try {
    const { isAccept, leadSfId } = args;
    const fetchedUser = await authenticate(_context, "DD");
    if (fetchedUser) {
      const leadFetchedBySfId = await getLeadDetailsFromId(leadSfId);

      if (leadFetchedBySfId) {
        const user = fetchedUser;
        const acceptRejectResult = await hanldeAcceptRejectByDesigners(
          isAccept,
          user,
          leadSfId,
          leadFetchedBySfId
        );
        acceptRejectResponse.code = 200;
        acceptRejectResponse.message = acceptRejectResult.message;
      } else {
        acceptRejectResponse.code = 400;
        acceptRejectResponse.message = "Lead Salesforce Id is not valid";
      }
    } else {
      acceptRejectResponse.code = 400;
      acceptRejectResponse.message = "No User found with given id";
    }
  } catch (e) {
    console.log(e);
    acceptRejectResponse.code = 400;
    acceptRejectResponse.message = e.message;
  }

  return acceptRejectResponse;
};

const hanldeAcceptRejectByDesigners = async (
  isAccept,
  user,
  leadSfId,
  leadFetchedBySfId
) => {
  const acceptRejectResponse: LeadsResponse = {
    code: 200,
    message: null,
    data: null,
  };
  if (isAccept) {
    console.log(757575);
    if (!leadFetchedBySfId.design_user__c) {
      acceptRejectResponse.data = await updateBroadCastedLeads(
        {
          broadcast_status__c: "1",
          design_user__c: user.salesforceuserid,
          has_designer_accepted__c: "Designer Accepted",
        },
        leadSfId
      );
      console.log(85, acceptRejectResponse.data);
      acceptRejectResponse.message = `Lead ${leadFetchedBySfId.name} accepted successfully`;
    } else {
      acceptRejectResponse.message = "designer is already assigned";
    }
  } else {
    if (leadFetchedBySfId.broadcast_status__c === "0") {
      const leadRejectedBy = leadFetchedBySfId.rejected_by__c;
      const leadRejectedByArr = leadRejectedBy ? leadRejectedBy.split(",") : [];
      if (!leadRejectedByArr.includes(user.userid)) {
        leadRejectedByArr.push(user.userid);
        acceptRejectResponse.data = await updateBroadCastedLeads(
          {
            has_designer_accepted__c: "Designer Rejected",
            rejected_by__c: leadRejectedByArr.toString(),
          },
          leadSfId
        );
        acceptRejectResponse.message = `Lead ${leadFetchedBySfId.name} rejected by the designer,your studio manager has been notified`;
      }
    }
  }
  return acceptRejectResponse;
};
