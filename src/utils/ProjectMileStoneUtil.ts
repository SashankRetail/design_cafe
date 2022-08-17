import ProjectMileStoneEnum from "../domain/enumerations/ProjectMileStoneEnum";
import SmartSheetCellValueEnum from "../domain/enumerations/SmartSheetCellValueEnum";
class ProjectMileStonesUtil {
  static getSheetMileStoneName(projectMileStone: string) {
    var mileStoneName;
    switch (projectMileStone) {
      case ProjectMileStoneEnum.PROJECT_SIGNUP:
        mileStoneName = SmartSheetCellValueEnum.PROJECT_SIGNUP;
        break;
      case ProjectMileStoneEnum.SITE_SURVEY:
        mileStoneName = SmartSheetCellValueEnum.SITE_SURVEY;
        break;
      case ProjectMileStoneEnum.KNOW_YOUR_CLIENT:
        mileStoneName = SmartSheetCellValueEnum.KNOW_YOUR_CLIENT;
        break;
      case ProjectMileStoneEnum.DESIGN_PRESENTATION:
        mileStoneName = SmartSheetCellValueEnum.FIRST_CUT_MEETING;
        break;
      case ProjectMileStoneEnum.DESIGN_FINALIZATION:
        mileStoneName = SmartSheetCellValueEnum.DESIGN_FINALIZATION;
        break;
      case ProjectMileStoneEnum.SITE_VALIDATION_REQUEST:
        mileStoneName = SmartSheetCellValueEnum.REQUEST_PM_FOR_KICKOFF;
        break;
      case ProjectMileStoneEnum.SITE_VALIDATION_MEETING:
        mileStoneName = SmartSheetCellValueEnum.KICKOFF_MEETING_AT_SITE;
        break;
      case ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION:
        mileStoneName = SmartSheetCellValueEnum.DWG_REVISIONS;
        break;
      case ProjectMileStoneEnum.GFC_CHECKING:
        mileStoneName = SmartSheetCellValueEnum.GFC_CHECKING;
        break;
      case ProjectMileStoneEnum.DESIGN_SIGNOFF:
        mileStoneName = SmartSheetCellValueEnum.DESIGN_SIGN_OFF;
        break;
      case ProjectMileStoneEnum.PRODUCTION_REQUEST:
        mileStoneName = SmartSheetCellValueEnum.PROJECT_RECEIVED_FOR_PLANNING;
        break;
      case ProjectMileStoneEnum.PRODUCTION:
        mileStoneName = SmartSheetCellValueEnum.PRODUCTION;
        break;
      case ProjectMileStoneEnum.READY_FOR_DISPATCH:
        mileStoneName = SmartSheetCellValueEnum.READY_FOR_DISPATCH;
        break;
      case ProjectMileStoneEnum.READY_FOR_HANDOVER:
        mileStoneName = SmartSheetCellValueEnum.READY_FOR_HANDOVER;
        break;
      case ProjectMileStoneEnum.HANDOVER:
        mileStoneName = SmartSheetCellValueEnum.HANDOVER;
        break;
    }
    return mileStoneName;
  }
}
export default ProjectMileStonesUtil;
