import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils"

export const getAllDepartments = async() => {
    try{
        const fetchedDepartment = await prisma.dc_department.findMany();

        defaultResponseObj.code = 200
        defaultResponseObj.message = "Success"
        defaultResponseObj.data = fetchedDepartment
    }
    catch(e){
        defaultResponseObj.code = 400
        defaultResponseObj.message = e.message
    }
    return defaultResponseObj;
}
