import dayjs from "dayjs";
// @ts-expect-error ignore
import utc from "dayjs-plugin-utc";

dayjs.extend(utc);

export default dayjs;
