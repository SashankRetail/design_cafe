import { prisma } from "../../../prismaConfig"
import SupportPalApi from "../../../domain/services/supportpal/SupportPalApi";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";
import { ProjectStageEnumUtil } from "../../../domain/enumerations/ProjectStageEnums"

export const webHookTicket = async (root, args, context) => {
    let webHookResponse;

    const { ticket_id } = args;

    try {

        const url = "ticket/ticket/" + ticket_id;
        const supportpalapi = new SupportPalApi()
        const gettickets: any = await supportpalapi.getFromSupportPalApi(url);
        const respone = gettickets;
        const data = respone.data;

        const supportPalCFInfo = SupportPalBaseUsecase().getSupportpalCustomField();
        const searchResult = data.customfields.filter(function (it) {
            return it.field_id === supportPalCFInfo.cf_clientidPk;
        });
        if (searchResult.length > 0) {
            let chm, designer, projectname, teamName, expCenter, designerEmail;
            const clientID = searchResult[0].value;

            const project = await prisma.dc_projects.findFirst({ where: { projectid: clientID } })
            if (project) {
                if (project.experiencecenterid) {
                    const expCenterResult = await getExperienceCenterInfo(project.experiencecenterid);
                    expCenter = expCenterResult.name;

                    expCenter = (supportPalCFInfo[expCenter] === undefined) ? '' : supportPalCFInfo[expCenter];
                }

                if (project.designstudioid) {
                    const teamResult = await getTeamInfo(project.designstudioid);
                    teamName = teamResult.name;

                    teamName = (supportPalCFInfo['TEAM_' + teamName] === undefined) ? '' : supportPalCFInfo['TEAM_' + teamName];
                }
                if (project.designerid) {
                    designer = await prisma.dc_users.findFirst({
                        where: { userid: project.designerid }

                    });
                    if (designer) {
                        designerEmail = designer.designcafeemail;

                    }
                }
                if (project.chmid) {
                    chm = await prisma.dc_users.findFirst({
                        where: { userid: project.chmid }
                    });
                }
                projectname = project.projectname;

            }


            let chmname;
            let chmId;
            if (chm) {
                chmname = (`${chm.firstname}` + ' ' + `${chm.lastname}`).trim();
                if (!chm.supportpaloperatorid) {
                    chm.supportpaloperatorid = await SupportPalBaseUsecase().getOrAddOperatorAndReturnId(chm.designcafeemail, chmname, 3)
                    chmId = chm.supportpaloperatorid;
                    await prisma.dc_users.update({
                        data: chm, where: { userid: chm.userid }
                    })
                }
                else {
                    chmId = chm.supportpaloperatorid
                }
            }

            const postTicket = {
                assignedto: [chmId],
                customfield: {
                    [supportPalCFInfo.cf_projectNamePk]: projectname,
                    // [supportPalCFInfo.cf_projectStagePk]: currentStage,
                    [supportPalCFInfo.cf_team_name]: teamName,
                    [supportPalCFInfo.cf_experienceCenterPk]: expCenter,
                    [supportPalCFInfo.cf_assigned_designer]: designerEmail
                },
                department: process.env.supportPalDepartment,
            }

            console.log('POST DATA=====', postTicket);
            const tickets: any = await supportpalapi.updateToSupportPalApi("ticket/ticket/" + ticket_id, postTicket);
            const res = tickets;

            console.log('RESPONSE DATA=====', res);
        }


        webHookResponse = {
            code: 200,
            message: "success",
        };

        return webHookResponse;


    } catch (error) {
        webHookResponse = { code: 400, message: error.message }
        return webHookResponse
    }
}

const getExperienceCenterInfo = async (experiencecenterid) => {
    return prisma.dc_experiencecenters.findFirst({ where: { centerid: experiencecenterid } })
}
const getTeamInfo = async (teamid) => {
    return prisma.dc_teams.findFirst({ where: { id: teamid } })
}

const getCurrentStage = async (project) => {
    let currentStage;
    if (!project) {
        currentStage = "Pre 5%"
    }
    else {
        if (project.currentmilestone) {
            if (project.currentmilestone === "Handover" && project.projectstatus.toLowerCase() === "completed") {
                currentStage = "Post Handover"
            }
            else {
                currentStage = await ProjectStageEnumUtil.getCurrentMilestone(project.currentmilestone)
            }
        }
    }
    return currentStage;

}
