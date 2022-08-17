import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import superagent from "superagent";

export const updateProject = async (root, args, context) => {
    const { clientid, shippingAddressCountry, shippingAddressShippingState, shippingAddressStreet1, shippingAddressStreet2, shippingAddressCity, shippingAddressZipOrPostalCode } = args;
    const project = await prisma.dc_projects.findFirst({
        where: { projectid: clientid },
    });
    console.log(project);
    if (!project) {
        throw new HttpError(400, "Project not found");
    }
    let shippingStreet;
    if (args.shippingAddressStreet1) {
        shippingStreet = args.shippingAddressStreet1.concat(" ", shippingAddressStreet2)
    }
    else {
        shippingStreet = shippingAddressStreet1;
    }
    const ProjectUpdateRequestToMicroservice = {
        shippingAddressCountry: shippingAddressCountry,
        shippingAddressShippingState: shippingAddressShippingState,
        shippingAddressCity: shippingAddressCity,
        shippingAddressStreet: shippingStreet,
        shippingAddressZipOrPostalCode: shippingAddressZipOrPostalCode,
        clientId: clientid
    }

    const updateProjectCapture = await postUpdateProjectToMicroservice(ProjectUpdateRequestToMicroservice);

    console.log("updateProjectCapture", updateProjectCapture.body)
    if (updateProjectCapture.body.statusCode !== 200) {
        throw new HttpError(201, updateProjectCapture.body.message);
    }
    const customerid = project.customerid;
    if (project) {
        const findaddress = await prisma.dc_addresses.findFirst({ where: { customerid: customerid, addresstype: 2 } })
        const updateadrress = await prisma.dc_addresses.update({
            where: {
                addressid: findaddress.addressid,
            },
            data: {
                zip: shippingAddressZipOrPostalCode,
                street: shippingStreet,
                state: shippingAddressShippingState,
                city: shippingAddressCity,
                country: shippingAddressCountry
            }
        });
        console.log(updateadrress);
    }
    return {
        statusCode: 200,
        message: "Shipping address  successfully"
    }
}
const postUpdateProjectToMicroservice = async (ProjectUpdateRequestToMicroservice) => {
    const paymiRes = await getPaymiConnection();
    const authToken = paymiRes.accessToken;
    const finalUrl = `${process.env.apiEndpoint}project`;
    console.log(finalUrl);

    try {
        return await superagent
            .put(finalUrl)
            .send(ProjectUpdateRequestToMicroservice)
            .set("Content-Type", "application/json")
            .set("Authorization", authToken)
    } catch (error) {
        console.log(error)
        throw error;
    }
}
const getPaymiConnection = async () => {
    const finalUrl = process.env.apiEndpoint + "authenticate"
    console.log(finalUrl);
    const reqBody = {
        clientId: process.env.CDClientId
    }
    try {
        const res = await superagent
            .post(finalUrl)
            .set("Content-Type", "application/json")
            .send(reqBody);
        return res.body;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

