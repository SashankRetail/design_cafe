import { prisma } from "../../../prismaConfig";
import { UploadFileOnS3 } from "../../../domain/services/baseUseCase/baseUseCase";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../utils/commonUtils";

export const updateMom = async (root, args, context) => {
  let momResponse;
  try {
    const user = await authenticate(context, "DD");
    const {
      id,
      designerid,
      meetingname,
      meetingagenda,
      meetingdescription,
      meetingdate,
      attachment,
      status,
    } = args;
    let toS3;

    if (attachment != null) {
      if (attachment.length) {
        await Promise.all(
          attachment.map(async (element) => {
            const attachedFile = {
              key: element.filename,
              contentType: element.Content_Type,
              base64: element.base64,
              userid: user.userid,
              momid: id,
            };
            toS3 = await UploadFileOnS3(attachedFile);

            element.data = toS3.location;
          })
        );
      }
    }
    let sentondate;
    if (status === "Shared") {
      sentondate = new Date();
    }

    const projectMom = await prisma.dc_project_mom.update({
      data: {
        designerid,
        meetingname,
        meetingagenda,
        meetingdescription,
        meetingdate,
        status,
        sentondate,
      },
      where: { id: id },
    });
    console.log(projectMom);
    const projectMOmObject = await prisma.dc_project_mom.findMany({
      where: { id: projectMom.id },
      include: {
        attachments: true,
        momComments: true,
      },
    });

    if (status === "Shared") {
      let selectedMilestone;
      const mom = await prisma.dc_project_mom.findFirst({ where: { id: id } });
      const project = await prisma.dc_projects.findFirst({
        where: { id: mom.projectid },
      });
      let milestonedetails = [],
        milestonechecklist = [];

      const milestones = project.milestones;
      milestonedetails = milestones["attributes"].milestone_details;
      milestonedetails.forEach(async (milestone) => {
        milestonechecklist = milestone.milestone_checklist;
        milestonechecklist.forEach(async (fetchedmilestone) => {
          if (
            fetchedmilestone.length !== 0 &&
            fetchedmilestone["checklist_string"] === meetingname
          ) {
            fetchedmilestone.is_checked = true;
            selectedMilestone = milestone;
          }
        });
      });
      await prisma.dc_projects.update({
        data: { milestones: milestones },
        where: { id: project.id },
      });
      await checkAndMarkMilestonesOnSmartsheet(project.id,selectedMilestone)
    }
    momResponse = { code: 200, message: "success", data: projectMOmObject };
    return momResponse;
  } catch (error) {
    momResponse = { code: 400, message: error.message };
    return momResponse;
  }
};
