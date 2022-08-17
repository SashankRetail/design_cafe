import { prisma } from "../../../prismaConfig"
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import HttpError from "standard-http-error";

export const getRequirementForm = async (root, args, context) => {
  let requirementFormResponseObj;
  try {
    const user = await authenticate(context, "CD")

    const lead = await prisma.lead.findFirst({ where: { mobilephone: user.customerphone } })

    if (!lead) {
      throw new HttpError(400, "Lead not found");
    }

    const kidsArr = []
    let obj;
    if (lead.gender_of_first_kid__c || lead.age_of_first_kid__c) {
      obj = {
        gender: lead.gender_of_first_kid__c,
        age: lead.age_of_first_kid__c
      }
      kidsArr.push(obj)
    }
    if (lead.gender_of_second_kid__c || lead.age_of_second_kid__c) {
      obj = {
        gender: lead.gender_of_second_kid__c,
        age: lead.age_of_second_kid__c
      }
      kidsArr.push(obj)
    }
    if (lead.gender_of_third_kid__c || lead.age_of_third_kid__c) {
      obj = {
        gender: lead.gender_of_third_kid__c,
        age: lead.age_of_third_kid__c
      }
      kidsArr.push(obj)
    }
    if (lead.gender_of_fourth_kid__c || lead.age_of_fourth_kid__c) {
      obj = {
        gender: lead.gender_of_fourth_kid__c,
        age: lead.age_of_fourth_kid__c
      }
      kidsArr.push(obj)
    }
    const getLeadFloorPlan = await prisma.dc_attachments.findFirst({ where: { id: Number(lead.floor_plan_attachment_id__c) } })
    const requirementformdetails = {
      home_type__c: lead.home_type__c,
      area__c: lead.area__c,
      scope_of_work__c: lead.scope_of_work__c,
      interior_work_needed_for__c: lead.interior_work_needed_for__c?.split(";"),
      where_are_you_currently_located__c: lead.where_are_you_currently_located__c,
      when_would_you_like_to_have_the_home__c: lead.when_would_you_like_to_have_the_home__c,
      which_language_are_you_most_comfortable__c: lead.which_language_are_you_most_comfortable__c?.split(";"),
      if_other_languages_please_specify__c: lead.if_other_languages_please_specify__c?.split(";"),
      who_will_be_staying_in_the_house__c: lead.who_will_be_staying_in_the_house__c?.split(";"),
      kids_details: kidsArr,
      do_you_have_pets__c: lead.do_you_have_pets__c,
      live__c: lead.live__c?.split(";"),
      others_for_live__c: lead.others_for_live__c,
      work__c: lead.work__c,
      eat__c: lead.eat__c?.split(";"),
      play__c: lead.play__c?.split(";"),
      others_for_play__c: lead.others_for_play__c,
      civil_work__c: lead.civil_work__c ? "Yes" : "No",
      requirement_details__c: lead.requirement_details__c?.split(";"),
      property_usage__c: lead.property_usage__c,
      site_service_needed_for__c: lead.site_service_needed_for__c?.split(";"),
      floor_plan: {
        id: getLeadFloorPlan?.leadid,
        documents: [
          {
            filename: getLeadFloorPlan?.filekey,
            Content_Type: getLeadFloorPlan?.contenttype,
            data: getLeadFloorPlan?.location,
          }
        ]
      }
    }
    console.log("requirementformdetails", requirementformdetails)
    const Data = {
      requirementformdetails
    }

    requirementFormResponseObj = { code: 200, message: "success", data: Data }
    return requirementFormResponseObj;
  } catch (error) {
    requirementFormResponseObj = { code: 400, message: error.message }
    return requirementFormResponseObj;
  }
};
