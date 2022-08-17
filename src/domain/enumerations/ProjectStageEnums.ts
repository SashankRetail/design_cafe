enum FifteenPercentStageEnum {
  "Project Signup",
  "Site Survey",
  "KYC",
  "Design Presentation",
  "Design Finalization",
}
enum ThirtyFivePercentStageEnum {
  "Site Validation Request",
  "Site Validation",
  "Post Site Validation Revision",
  "GFC Checking",
  "Design Sign-Off",
}
enum FortyFivePercentStageEnum {
  "Production Request",
  "Production",
  "Ready for Dispatch",
  "Ready for Handover",
  "Handover",
}
enum ProjectStageEnum {
  PROJECT_SIGNUP = "Project Signup",
  SITE_SURVEY = "Site Survey",
  KYC = "KYC",
  DESIGN_PRESENTATION = "Design Presentation",
  DESIGN_FINALIZATION = "Design Finalization",
  SITE_VALIDATION_REQUEST = "Site Validation Request",
  SITE_VALIDATION = "Site Validation",
  POST_SITE_VALIDATION_REVISION = "Post Site Validation Revision",
  GFC_CHECKING = "GFC Checking",
  DESIGN_SIGNOFF = "Design Sign-Off",
  PRODUCTION_REQUEST = "Production Request",
  PRODUCTION = "Production",
  READY_FOR_DISPATCH = "Ready for Dispatch",
  READY_FOR_HANDOVER = "Ready for Handover",
  HANDOVER = "Handover"
}
enum ProjectStageValue {
  FIVE_FIFTEEN = "5% - 15%",
  FIFTEEN_THIRTYFIVE = "15% - 35%",
  THIRTYFIVE_FORTYFIVE = "35% - 45%",
  FORTYFIVE_HANDOVER = "45% to handover"
}
class ProjectStageEnumUtil {
  static getCurrentMilestone(milestone: string) {
    let paymentStage;
    switch (milestone) {
      case ProjectStageEnum.PROJECT_SIGNUP:
        paymentStage = ProjectStageValue.FIVE_FIFTEEN;
        break;
      case ProjectStageEnum.SITE_SURVEY:
        paymentStage = ProjectStageValue.FIVE_FIFTEEN;
        break;
      case ProjectStageEnum.KYC:
        paymentStage = ProjectStageValue.FIVE_FIFTEEN;
        break;
      case ProjectStageEnum.DESIGN_PRESENTATION:
        paymentStage = ProjectStageValue.FIVE_FIFTEEN;
        break;
      case ProjectStageEnum.DESIGN_FINALIZATION:
        paymentStage = ProjectStageValue.FIVE_FIFTEEN;
        break;
      case ProjectStageEnum.SITE_VALIDATION_REQUEST:
        paymentStage = ProjectStageValue.FIFTEEN_THIRTYFIVE;
        break;
      case ProjectStageEnum.SITE_VALIDATION:
        paymentStage = ProjectStageValue.FIFTEEN_THIRTYFIVE;
        break;
      case ProjectStageEnum.POST_SITE_VALIDATION_REVISION:
        paymentStage = ProjectStageValue.FIFTEEN_THIRTYFIVE;
        break;
      case ProjectStageEnum.GFC_CHECKING:
        paymentStage = ProjectStageValue.FIFTEEN_THIRTYFIVE;
        break;
      case ProjectStageEnum.DESIGN_SIGNOFF:
        paymentStage = ProjectStageValue.FIFTEEN_THIRTYFIVE;
        break;
      case ProjectStageEnum.PRODUCTION_REQUEST:
        paymentStage = ProjectStageValue.THIRTYFIVE_FORTYFIVE;
        break;
      case ProjectStageEnum.PRODUCTION:
        paymentStage = ProjectStageValue.THIRTYFIVE_FORTYFIVE;
        break;
      case ProjectStageEnum.READY_FOR_DISPATCH:
        paymentStage = ProjectStageValue.THIRTYFIVE_FORTYFIVE;
        break;
      case ProjectStageEnum.READY_FOR_HANDOVER:
        paymentStage = ProjectStageValue.THIRTYFIVE_FORTYFIVE;
        break;
      case ProjectStageEnum.HANDOVER:
        paymentStage = ProjectStageValue.FORTYFIVE_HANDOVER;
        break;
    }
    return paymentStage
  }
}

export { FifteenPercentStageEnum, ThirtyFivePercentStageEnum, FortyFivePercentStageEnum, ProjectStageEnumUtil };
