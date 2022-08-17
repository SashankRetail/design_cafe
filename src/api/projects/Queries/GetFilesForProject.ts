import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils";

export const getFilesForProjects = async(_root, args, _context) =>{
     const {id} = args;
     try{
        const project = await prisma.dc_projects.findUnique({
            where:{
                id:id
            }
        })
        if(!project){
            defaultResponseObj.code = 400
            defaultResponseObj.message = 'No Project found for given Id'
            return defaultResponseObj;
        }
        defaultResponseObj.code = 200
        defaultResponseObj.data = project.milestones.attributes.files_checklist;
     }
     catch(e){
        defaultResponseObj.code = 400
        defaultResponseObj.message = e.message
     }
     return defaultResponseObj;
}
