import { prisma } from "../../../prismaConfig";
import {
  UploadFileOnS3,
  uploadFloorPlanAtSalesForce,
} from "../../../domain/services/baseUseCase/baseUseCase";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { validateInput } from "../../customers/requirementForm/Mutations/editForm";
import HttpError from "standard-http-error";

export const editRequirements = async (root, args, context) => {
  let editRequirementsResponseObj;

  const { requirementdetails, leadid } = args;

  try {
    const user = await authenticate(context, "DD");

    await validateInput(requirementdetails);

    const floorPlanReq = requirementdetails?.floor_plan;
    const fetchLead = await prisma.lead.findFirst({ where: { id: leadid } });
    if (!fetchLead) {
      throw new HttpError(400, "lead not found");
    }
    floorPlanReq.id = fetchLead.sfid;
    const response = await getFloorPlanLocation(floorPlanReq, fetchLead, user);

    await prisma.lead.update({
      data: {
        home_type__c: requirementdetails?.home_type__c,
        area__c: requirementdetails?.area__c.toString(),
        scope_of_work__c: requirementdetails?.scope_of_work__c,
        civil_work__c:
          requirementdetails?.civil_work__c === "Yes" ? true : false,
        site_service_needed_for__c:
          requirementdetails?.site_service_needed_for__c?.join(";"),
        interior_work_needed_for__c:
          requirementdetails?.interior_work_needed_for__c?.join(";"),
        requirement_details__c:
          requirementdetails?.requirement_details__c?.join(";"),
        property_usage__c: requirementdetails?.property_usage__c,
        where_are_you_currently_located__c:
          requirementdetails?.where_are_you_currently_located__c,
        when_would_you_like_to_have_the_home__c:
          requirementdetails?.when_would_you_like_to_have_the_home__c,
        which_language_are_you_most_comfortable__c:
          requirementdetails?.which_language_are_you_most_comfortable__c?.join(
            ";"
          ),
        if_other_languages_please_specify__c:
          requirementdetails?.if_other_languages_please_specify__c?.join(";"),
        who_will_be_staying_in_the_house__c:
          requirementdetails?.who_will_be_staying_in_the_house__c?.join(";"),
        gender_of_first_kid__c: requirementdetails?.kids_details
          ? requirementdetails.kids_details[0]?.gender
          : null,
        gender_of_second_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[1]?.gender
          : null,
        gender_of_third_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[2]?.gender
          : null,
        gender_of_fourth_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[3]?.gender
          : null,
        age_of_first_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[0]?.age?.toString()
          : null,
        age_of_second_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[1]?.age?.toString()
          : null,
        age_of_third_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[2]?.age?.toString()
          : null,
        age_of_fourth_kid__c: requirementdetails?.kids_details
          ? requirementdetails?.kids_details[3]?.age?.toString()
          : null,
        do_you_have_pets__c: requirementdetails?.do_you_have_pets__c,
        live__c: requirementdetails?.live__c?.join(";"),
        others_for_live__c: requirementdetails?.others_for_live__c,
        work__c: requirementdetails?.work__c,
        eat__c: requirementdetails?.eat__c?.join(";"),
        play__c: requirementdetails?.play__c?.join(";"),
        others_for_play__c: requirementdetails?.others_for_play__c,
        floor_plan_attachment_id__c: response
          ? response.id.toString()
          : fetchLead.floor_plan_attachment_id__c,
      },
      where: { id: leadid },
    });

    editRequirementsResponseObj = {
      code: 200,
      message: "Requirement Form Updated Successfully",
    };
    return editRequirementsResponseObj;
  } catch (error) {
    editRequirementsResponseObj = { code: 400, message: error.message };
    return editRequirementsResponseObj;
  }
};
const getFloorPlanLocation = async (floorPlanReq, lead, user) => {
  let res, location, respone;
  if (
    floorPlanReq.documents[0].data.match(
      /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/
    )
  ) {
    const attachmentReq = {
      key: floorPlanReq.documents[0].filename,
      contentType: floorPlanReq.documents[0].Content_Type,
      base64: floorPlanReq.documents[0].data,
      ispreorpost: 2,
      user: user.userid,
      leadid: lead.sfid,
    };

    respone = await UploadFileOnS3(attachmentReq);
    location = respone.location;

    res = await uploadFloorPlanAtSalesForce(floorPlanReq);
    if (res?.status?.toLowerCase() === "error") {
      return { code: 400, message: "Error Uploading Requirement Form" };
    }
  } else {
    location = floorPlanReq.documents[0].data;
  }
  return respone;
};
