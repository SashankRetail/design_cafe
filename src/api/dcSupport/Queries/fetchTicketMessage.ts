import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";

export const fetchTicketMessage = async (root, args, context) => {
    let FetchTicketMessageResponse;

    const { ticket_id } = args;

    try {
        await authenticateDdCd(context)

        const commentsArr: any[] = [];
        let description;

        const res = await SupportPalBaseUsecase().getTicketMessages(ticket_id);
        if (res && res.status === "success" && res.data.length) {
            if (res.data[0]?.purified_text) {
                description = res.data[0]?.purified_text.replace(/(<([^>]+)>)/ig, '');
            }
        }
        const dataArr = res.data
        //console.log(38, dataArr)
        for await (const data of dataArr) {
            const imageArr: any[] = [];
            const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
            date.setUTCSeconds(data.created_at);
            for await (const element of data?.attachments) {

                imageArr.push({
                    name: element?.original_name,
                    type: element?.upload?.mime,
                    data: element?.direct_frontend_url,
                });
            }
            let str;
            if (data?.purified_text) {
                str = data?.purified_text.replace(/(<([^>]+)>)/ig, '');
            }
            commentsArr.push({
                message: str ? str : "",
                by: data.user_name,
                type: data.type,
                timesent: date,
                imageArr,
            });
        }

        FetchTicketMessageResponse = { code: 200, message: "success", description: description, comments: commentsArr }
        return FetchTicketMessageResponse;


    } catch (error) {
        FetchTicketMessageResponse = { code: 400, message: error.message }
        return FetchTicketMessageResponse;
    }

};
