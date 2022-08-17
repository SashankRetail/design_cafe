import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils";

export const getSubTaskForProject = async(_parent, args, _context)=> {
    const {projectid} = args;
    const milestonesArr = []
    try{
        const project = await prisma.dc_projects.findUnique({
            where:{
                id:projectid
            }
        })

        if(!project){
            defaultResponseObj.code=400
            defaultResponseObj.message='Project not found for the given id';
            defaultResponseObj.data = null
            return defaultResponseObj;
        }

        // console.log(23,project.milestones.attributes.milestone_details)

        project.milestones.attributes.milestone_details.forEach(mileStones => {
            milestonesArr.push(mileStones)
        });

        defaultResponseObj.code=200
        defaultResponseObj.message=null;
        defaultResponseObj.data=milestonesArr;
    }
    catch(e){
        defaultResponseObj.code=400
        defaultResponseObj.message=e.message;
        defaultResponseObj.data = null
    }
    return defaultResponseObj;
}
