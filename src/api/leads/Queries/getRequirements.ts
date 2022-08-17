import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import HttpError from "standard-http-error";

export const getRequirements = async (root, args, context) => {
  let requirementFormResponseObj;
  try {
    await authenticate(context, "DD");
    const kidsArr = [];
    let obj;
    let fetchedLead;
    if (args.leadid) {
      fetchedLead = await prisma.lead.findFirst({ where: { id: args.leadid } });
      if (!fetchedLead) {
        throw new HttpError(400, "lead not found");
      }
    } else if (args.opportunityid) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { sfid: args.opportunityid },
      });
      if (!opportunity) {
        throw new HttpError(400, "opportunity not found");
      }
      const leadid = opportunity.lead_id__c;
      fetchedLead = await prisma.lead.findUnique({ where: { sfid: leadid } });
    }

    if (fetchedLead.gender_of_first_kid__c || fetchedLead.age_of_first_kid__c) {
      obj = {
        gender: fetchedLead.gender_of_first_kid__c,
        age: fetchedLead.age_of_first_kid__c,
      };
      kidsArr.push(obj);
    }
    if (
      fetchedLead.gender_of_second_kid__c ||
      fetchedLead.age_of_second_kid__c
    ) {
      obj = {
        gender: fetchedLead.gender_of_second_kid__c,
        age: fetchedLead.age_of_second_kid__c,
      };
      kidsArr.push(obj);
    }
    if (fetchedLead.gender_of_third_kid__c || fetchedLead.age_of_third_kid__c) {
      obj = {
        gender: fetchedLead.gender_of_third_kid__c,
        age: fetchedLead.age_of_third_kid__c,
      };
      kidsArr.push(obj);
    }
    if (
      fetchedLead.gender_of_fourth_kid__c ||
      fetchedLead.age_of_fourth_kid__c
    ) {
      obj = {
        gender: fetchedLead.gender_of_fourth_kid__c,
        age: fetchedLead.age_of_fourth_kid__c,
      };
      kidsArr.push(obj);
    }
    const getLeadFloorPlan = await prisma.dc_attachments.findFirst({
      where: { id: Number(fetchedLead.floor_plan_attachment_id__c) },
    });
    console.log(987, getLeadFloorPlan);

    const requirementdetails = {
      home_type__c: fetchedLead.home_type__c,
      area__c: fetchedLead.area__c,
      scope_of_work__c: fetchedLead.scope_of_work__c,
      interior_work_needed_for__c:
        fetchedLead.interior_work_needed_for__c?.split(";"),
      where_are_you_currently_located__c:
        fetchedLead.where_are_you_currently_located__c,
      when_would_you_like_to_have_the_home__c:
        fetchedLead.when_would_you_like_to_have_the_home__c,
      which_language_are_you_most_comfortable__c:
        fetchedLead.which_language_are_you_most_comfortable__c?.split(";"),
      if_other_languages_please_specify__c:
        fetchedLead.if_other_languages_please_specify__c?.split(";"),
      who_will_be_staying_in_the_house__c:
        fetchedLead.who_will_be_staying_in_the_house__c?.split(";"),
      kids_details: kidsArr,
      do_you_have_pets__c: fetchedLead.do_you_have_pets__c,
      live__c: fetchedLead.live__c?.split(";"),
      others_for_live__c: fetchedLead.others_for_live__c,
      work__c: fetchedLead.work__c,
      eat__c: fetchedLead.eat__c?.split(";"),
      play__c: fetchedLead.play__c?.split(";"),
      others_for_play__c: fetchedLead.others_for_play__c,
      civil_work__c: fetchedLead.civil_work__c ? "Yes" : "No",
      requirement_details__c: fetchedLead.requirement_details__c?.split(";"),
      property_usage__c: fetchedLead.property_usage__c,
      site_service_needed_for__c:
        fetchedLead.site_service_needed_for__c?.split(";"),
      floor_plan: {
        id: getLeadFloorPlan?.leadid,
        documents: [
          {
            filename: getLeadFloorPlan?.filekey,
            Content_Type: getLeadFloorPlan?.contenttype,
            data: getLeadFloorPlan?.location,
          },
        ],
      },
    };
    console.log("requirementdetails", requirementdetails);
    const Data = {
      requirementformdetails: requirementdetails,
    };

    requirementFormResponseObj = { code: 200, message: "success", data: Data };
    return requirementFormResponseObj;
  } catch (error) {
    requirementFormResponseObj = { code: 400, message: error.message };
    return requirementFormResponseObj;
  }
};
