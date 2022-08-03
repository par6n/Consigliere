import { injectable } from 'tsyringe';

const QUARTERS = [0, 15, 30, 45, 60];
const PERIOD_LENGTH = 30; // in minutes

/**
 * This service suggests a time range based on the current time. Simple.
 */
@injectable()
export class TimeAdvisorService {
  /**
   * Suggest a time period.
   */
  suggest(currentTime = new Date()): [Date, Date] {
    const from = this.closestQuarter(currentTime);
    const to = new Date(from);

    to.setMinutes(to.getMinutes() + PERIOD_LENGTH);

    return [from, to];
  }

  /**
   * Finds the closest quarter.
   */
  closestQuarter(time: Date): Date {
    const minutes = time.getMinutes();

    const diffs = QUARTERS.map((q) => ({ q, d: Math.abs(minutes - q) }));
    const smallest = diffs.sort((a, b) => a.d - b.d)[0];
    const closestMinute = smallest.q;

    const result = new Date(time);
    result.setMinutes(closestMinute);
    result.setSeconds(0);
    result.setMilliseconds(0);

    return result;
  }
}
