import HttpError from "standard-http-error";

enum FileCheckListName {
  SURVEY_DRAWINGS = "Survey Drawings",
  SITE_IMAGES = "Site Images",
  DESIGN_PRESENTATION = "Design Presentation",
  MODULAR_QUOTATION = "Modular Quotation",
  SITE_SERVICES_QUOTATION = "Site Services Quotation",
  MODULAR_DRAWINGS = "Modular Drawings",
  SITE_SERVICE_DRAWINGS = "Site Service Drawings",
  SIGN_OFF_PPT = "Sign-off PPT",
  FINISHES_AND_HANDLES = "Finishes & Handles"
}

enum MilestoneCheckListName {
  SURVEY_DRAWINGS = "Upload Survey Drawings",
  SITE_IMAGES = "Upload Site Images",
  DESIGN_PRESENTATION = "Upload Design Presentation",

}

const getFileChecklistName = async (checkListnameInRequest: string) => {

  if (!checkListnameInRequest) {
    throw new HttpError(400, "filename is required");
  }

  const checklistname = checkListnameInRequest.trim();

  if (checklistname === FileCheckListName.SURVEY_DRAWINGS) {
    return MilestoneCheckListName.SURVEY_DRAWINGS;
  } else if (checklistname === FileCheckListName.SITE_IMAGES) {
    return MilestoneCheckListName.SITE_IMAGES;
  } else if (checklistname === FileCheckListName.DESIGN_PRESENTATION) {
    return MilestoneCheckListName.DESIGN_PRESENTATION;
  } else if (checklistname === FileCheckListName.MODULAR_QUOTATION) {
    return FileCheckListName.MODULAR_QUOTATION;
  } else if (checklistname === FileCheckListName.SITE_SERVICES_QUOTATION) {
    return FileCheckListName.SITE_SERVICES_QUOTATION;
  } else if (checklistname === FileCheckListName.MODULAR_DRAWINGS) {
    return FileCheckListName.MODULAR_DRAWINGS;
  } else if (checklistname === FileCheckListName.SITE_SERVICE_DRAWINGS) {
    return FileCheckListName.SITE_SERVICE_DRAWINGS;
  } else if (checklistname === FileCheckListName.SIGN_OFF_PPT) {
    return FileCheckListName.SIGN_OFF_PPT;
  } else if (checklistname === FileCheckListName.FINISHES_AND_HANDLES) {
    return FileCheckListName.FINISHES_AND_HANDLES;
  }
  else {
    throw new HttpError(400, "Invalid filename");
  }

}
export { getFileChecklistName, FileCheckListName };
