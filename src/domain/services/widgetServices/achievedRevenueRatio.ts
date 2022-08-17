import { prisma } from "../../../prismaConfig"
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isBetween)
dayjs.extend(isoWeek)

export const achievedRevenueRatio = async (user, month) => {
    const projectPredicate: any = {}
    let res;

    switch (user.profile.access_level) {
        case 0:
            projectPredicate.designerid = user.userid
            res = getAchievedRevenueForProjects(
                projectPredicate,
                month

            );
            break;
        case 1:
            user.users_team?.map(async (team) => {
                projectPredicate.designstudioid = team.teamid
            })

            res = getAchievedRevenueForProjects(
                projectPredicate,
                month

            );
            break;
    }
    return res;
}

const getAchievedRevenueForProjects = async (projectPredicate, month) => {
    console.log("project Predicate", projectPredicate);
    let totalRevenue = 0;

    const date = new Date();
    const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const currentMonthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const lastMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastMonthEnd = new Date(date.getFullYear(), date.getMonth() - 1 + 1, 0);

    const projects = await prisma.dc_projects.findMany({ where: projectPredicate })
    await Promise.all(
        projects.map(async project => {
            const payments = await prisma.dc_paymentreceipts.findMany({ where: { clientid: project.projectid } })
            if (payments) {
                payments.map(async payment => {
                    const paymentRecievedDate = payment.paymentreceiveddate
                    if (paymentRecievedDate) {
                        const paymentRecievedDateToDate = dayjs(paymentRecievedDate)
                        if (month === 0) {
                            if (paymentRecievedDateToDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]")) {

                                totalRevenue = totalRevenue + payment.receivedamount

                            }
                        } else if (month === 1) {
                            if (paymentRecievedDateToDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]")) {

                                totalRevenue = totalRevenue + payment.receivedamount

                            }

                        }


                    }


                })
            }
        })
    )

    return totalRevenue
}
