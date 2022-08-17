import { prisma } from "../../../../prismaConfig"
import { UploadFileOnS3, uploadFloorPlanAtSalesForce } from "../../../../domain/services/baseUseCase/baseUseCase";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import HttpError from "standard-http-error";

let requirementFormResponseObj

export const editRequirementForm = async (_root, args, _context) => {

  const {
    requirementformdetails,
  } = args;

  try {

    const user = await authenticate(_context, "CD")

    let result, response;


    await validateInput(requirementformdetails)


    const floorPlan = requirementformdetails?.floor_plan;
    const lead = await prisma.lead.findFirst({ where: { mobilephone: user.customerphone } })

    const sfleadid = lead.sfid;
    floorPlan.id = sfleadid;
    if (((floorPlan.documents[0].data).match(/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/))) {
      const attachment = {
        key: floorPlan.documents[0].filename,
        contentType: floorPlan.documents[0].Content_Type,
        base64: floorPlan.documents[0].data,
        ispreorpost: 2,
        customer: user.customerid,
        leadid: lead.sfid
      };

      response = await UploadFileOnS3(attachment);

      result = await uploadFloorPlanAtSalesForce(floorPlan);
      if (result?.status?.toLowerCase() === "error") {
        return { code: 400, message: "Error Uploading Requirement Form" }

      }
    }
    await prisma.lead.update({
      data: {
        home_type__c: requirementformdetails?.home_type__c,
        area__c: requirementformdetails?.area__c.toString(),
        scope_of_work__c: requirementformdetails?.scope_of_work__c,
        civil_work__c: (requirementformdetails?.civil_work__c === "Yes") ? true : false,
        site_service_needed_for__c: requirementformdetails?.site_service_needed_for__c?.join(";"),
        interior_work_needed_for__c: requirementformdetails?.interior_work_needed_for__c?.join(";"),
        requirement_details__c: requirementformdetails?.requirement_details__c?.join(";"),
        property_usage__c: requirementformdetails?.property_usage__c,
        where_are_you_currently_located__c: requirementformdetails?.where_are_you_currently_located__c,
        when_would_you_like_to_have_the_home__c: requirementformdetails?.when_would_you_like_to_have_the_home__c,
        which_language_are_you_most_comfortable__c: requirementformdetails?.which_language_are_you_most_comfortable__c?.join(";"),
        if_other_languages_please_specify__c: requirementformdetails?.if_other_languages_please_specify__c?.join(";"),
        who_will_be_staying_in_the_house__c: requirementformdetails?.who_will_be_staying_in_the_house__c?.join(";"),
        //how_many_kids_do_you_have__c: noOfKids.toString(),
        gender_of_first_kid__c: requirementformdetails?.kids_details ? requirementformdetails.kids_details[0]?.gender : null,
        gender_of_second_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[1]?.gender : null,
        gender_of_third_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[2]?.gender : null,
        gender_of_fourth_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[3]?.gender : null,
        age_of_first_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[0]?.age?.toString() : null,
        age_of_second_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[1]?.age?.toString() : null,
        age_of_third_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[2]?.age?.toString() : null,
        age_of_fourth_kid__c: requirementformdetails?.kids_details ? requirementformdetails?.kids_details[3]?.age?.toString() : null,
        do_you_have_pets__c: requirementformdetails?.do_you_have_pets__c,
        live__c: requirementformdetails?.live__c?.join(";"),
        others_for_live__c: requirementformdetails?.others_for_live__c,
        work__c: requirementformdetails?.work__c,
        eat__c: requirementformdetails?.eat__c?.join(";"),
        play__c: requirementformdetails?.play__c?.join(";"),
        others_for_play__c: requirementformdetails?.others_for_play__c,
        floor_plan_attachment_id__c: response ? response.id.toString() : lead.floor_plan_attachment_id__c
      }, where: { id: lead.id }
    });

    await prisma.dc_customer.update({
      data: {
        requirementformuploaded: true
      }, where: { customerid: user.customerid }
    })

    requirementFormResponseObj = { code: 200, message: "Thank you for taking your time in filling the form. We will get back to you at the earliest." }
    return requirementFormResponseObj

  } catch (error) {
    requirementFormResponseObj = { code: 400, message: error.message }
    return requirementFormResponseObj
  }
};
export const validateInput = async (requirementformdetails) => {
  if (!requirementformdetails.home_type__c) {
    throw new HttpError(
      400,
      "Property type is required"
    );
  }
  if (!requirementformdetails.scope_of_work__c) {
    throw new HttpError(
      400,
      "Scope of work is required"
    );
  }
  if (!requirementformdetails.interior_work_needed_for__c) {
    throw new HttpError(
      400,
      "Interior work needed for is required"
    );
  }
  if (!requirementformdetails.requirement_details__c) {
    throw new HttpError(
      400,
      "Interior details is required"
    );
  }
  if (!requirementformdetails.civil_work__c) {
    throw new HttpError(
      400,
      "Do you need any site services is required"
    );
  }
  if (!requirementformdetails.property_usage__c) {
    throw new HttpError(
      400,
      "Property usage is required"
    );
  }
  if (!requirementformdetails.where_are_you_currently_located__c) {
    throw new HttpError(
      400,
      "Where are you currently located is required"
    );
  }
  if (!requirementformdetails.which_language_are_you_most_comfortable__c) {
    throw new HttpError(
      400,
      "Which language are you most comfortable in is required"
    );
  }
  if (!requirementformdetails.floor_plan) {
    throw new HttpError(
      400,
      "floor plan is required"
    );
  }
  if (typeof (requirementformdetails?.area__c) !== "number") {
    throw new HttpError(
      400,
      "floor area must be a number"
    );
  }
  await validateKidsDetails(requirementformdetails)
}
const validateKidsDetails = async(requirementformdetails)=>{
  if (requirementformdetails?.kids_details) {
    await Promise.all(
      requirementformdetails?.kids_details?.map(element => {
        if (element.age) {
          if (typeof (element.age) !== "number") {
            throw new HttpError(
              400,
              "Kids age must be a number"
            );
          }
        }
      })
    )
  }

}
