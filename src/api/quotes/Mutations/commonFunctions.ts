import { getApprovalStatus } from "../../projects/Mutations/AddMilestoneFiles";
import { prisma } from "../../../prismaConfig";

export const addPdfToMilestone = async (_project, _checklistType, _file) => {
  const filesChecklistData = _project?.milestones?.attributes?.files_checklist;
  filesChecklistData.forEach((val) => {
    if (val.length !== 0 && val?.checklist_string === _checklistType) {
      val.filekey = _file.key;
      val.fileurl = _file.location;
      val.contentType = _file.contentType;
      const res = getApprovalStatus(val.approval_from_customer);
      val.approvalstatus = res.status;
      val.sentondate = res.sentOnDate;
      val.uploadedon = new Date();
      val.created_at = new Date();
      val.updated_at = new Date();
    }
  });
  _project.milestones.attributes.files_checklist = filesChecklistData;
  await prisma.dc_projects.update({
    where: { id: _project.id },
    data: { milestones: _project.milestones },
  });
};
