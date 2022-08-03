import { injectable } from 'tsyringe';
import { Room } from '../config/rooms';
import { GraphService } from './graph.service';
import { formatDateTime } from '../utils/format-date-time';

const TIMEZONE = 'Central Europe Standard Time';

export type Event = {
  meetingName: string;
  start: Date;
  end: Date;
  room: Room;
};

/**
 * Books new events in the calendar.
 */
@injectable()
export class BookingService {
  /**
   * @constructor
   * @param {GraphService} graphService
   */
  constructor(private readonly graphService: GraphService) {}

  /**
   *
   * @param {Event} event
   */
  async book(event: Event) {
    const body = JSON.stringify({
      subject: event.meetingName,
      start: {
        dateTime: formatDateTime(event.start),
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: formatDateTime(event.end),
        timeZone: TIMEZONE,
      },
      location: {
        displayName: event.room.name,
        locationType: 'conferenceRoom',
        locationEmailAddress: event.room.mailbox,
      },
      attendees: [
        {
          emailAddress: {
            address: event.room.mailbox,
            name: event.room.name,
          },
          type: 'required',
        },
      ],
    });

    return this.graphService.call<{ error?: unknown }>('/me/calendar/events', {
      method: 'POST',
      body,
    });
  }
}
