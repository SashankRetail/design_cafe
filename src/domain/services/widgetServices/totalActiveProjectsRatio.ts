import { prisma } from "../../../prismaConfig"
import { getUser } from "../../../api/users/Mutations/GetUser";
import { FifteenPercentStageEnum, ThirtyFivePercentStageEnum, FortyFivePercentStageEnum } from "../../enumerations/ProjectStageEnums"

export const totalActiveProjectsRatio = async (user) => {
    const projectPredicate: any = {}
    let res;

    switch (user.profile.access_level) {
        case 0:
            projectPredicate.OR = []
            projectPredicate.OR.push({
                designerid: user.userid,
                projectstatus: "Active"
            })
            res = getTotalActiveProjects(
                projectPredicate

            );
            break;
        case 1:
            const fetchUser = await getUser(user.userid)

            projectPredicate.OR = []
            fetchUser[0].teams?.map(async (team) => {
                projectPredicate.OR.push({
                    designstudioid: team.id,
                    projectstatus: "Active"

                })
            })

            res = getTotalActiveProjects(
                projectPredicate

            );
            break;
    }
    return res;
}

const getTotalActiveProjects = async (projectPredicate) => {
    console.log("project Predicate", projectPredicate);
    const projects = await prisma.dc_projects.findMany({ where: projectPredicate })
    let fifteenPercCount = 0
    let thiryFivePercCount = 0
    let fortyFivePercCount = 0
    const fifteenStageData = [], thirtyFiveStageData = [], fortyFiveStageData = [];
    const ProjectDataArr = []

    if (projects && projects.length > 0) {
        projects.forEach(project => {
            if (project.currentmilestone) {
                const fifteenPercStageArr = Object.values(FifteenPercentStageEnum)
                const thirtyFivePercStageArr = Object.values(ThirtyFivePercentStageEnum)
                const fortyFivePercStageArr = Object.values(FortyFivePercentStageEnum)

                if (fifteenPercStageArr.includes(project.currentmilestone)) {
                    fifteenPercCount++
                    fifteenStageData.push({
                        projectname: project.projectname,
                        delayStatus: project.projectdelay
                    })
                }
                else if (thirtyFivePercStageArr.includes(project.currentmilestone)) {
                    thiryFivePercCount++
                    thirtyFiveStageData.push({
                        projectname: project.projectname,
                        delayStatus: project.projectdelay

                    })
                }
                else if (fortyFivePercStageArr.includes(project.currentmilestone)) {
                    fortyFivePercCount++
                    fortyFiveStageData.push({
                        projectname: project.projectname,
                        delayStatus: project.projectdelay
                    })
                }
            }
            else {
                fifteenPercCount++
            }
        });
    }
    ProjectDataArr.push({
        totalCount: projects.length,
        fifteenStageData,
        thirtyFiveStageData,
        fortyFiveStageData
    })
    console.log("======projects", fifteenPercCount, thiryFivePercCount, fortyFivePercCount);
    return ProjectDataArr
}
