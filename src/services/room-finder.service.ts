import { injectable } from 'tsyringe';
import { GraphService } from './graph.service';
import { Room, ROOMS_LIST } from '../config/rooms';
import { formatDateTime } from '../utils/format-date-time';

const TIMEZONE = 'Central Europe Standard Time';

export type RoomStatus = {
  room: Room;
  available: boolean;
};

export type ScheduleResponse = {
  value: { scheduleId: string; scheduleItems: object[] }[];
};

/**
 * This service will list you the meeting rooms plus their availability status for the given time.
 */
@injectable()
export class RoomFinderService {
  constructor(private readonly graphService: GraphService) {}

  /**
   * List rooms with availability status.
   */
  async listRooms(from: Date, to: Date) {
    const resp = await this.graphService.call<ScheduleResponse>('/me/calendar/getschedule', {
      method: 'POST',
      body: JSON.stringify({
        Schedules: ROOMS_LIST.map((room) => room.mailbox),
        StartTime: {
          dateTime: formatDateTime(from),
          timeZone: TIMEZONE,
        },
        EndTime: {
          dateTime: formatDateTime(to),
          timeZone: TIMEZONE,
        },
        availabilityViewInterval: '15',
      }),
      headers: {
        Prefer: `outlook.timezone="${TIMEZONE}"`,
      },
    });

    if (!resp.value?.length) {
      throw new Error(`Unexpected response: ${JSON.stringify(resp)}`);
    }

    const rooms: RoomStatus[] = resp.value.map((entry) => {
      const room = ROOMS_LIST.find((r) => r.mailbox === entry.scheduleId) as Room;
      return {
        room,
        available: entry.scheduleItems.length === 0,
      };
    });

    return rooms;
  }
}
