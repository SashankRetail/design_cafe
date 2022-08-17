import WidgetMonthEnums from "../../enumerations/WidgetMonthEnums";

export const widgetGetMonth = async (month) => {
    let monthres;
    const d = new Date();
    if (month === WidgetMonthEnums.THIS_MONTH) {
        monthres = d.getMonth();
    }
    if (month === WidgetMonthEnums.PREVIOUS_MONTH) {
        monthres = d.getMonth() - 1;
    }
    return monthres

}
